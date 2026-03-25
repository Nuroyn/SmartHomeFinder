import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// ── Cloudinary helpers ──

// Derive Cloudinary public_id and resource_type from a secure URL
const parseCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("/upload/")) return null;

  // Capture resource type (image, video, raw) if present in URL path
  const resourceMatch = url.match(/\/(image|video|raw)\/upload\//);
  const resource_type = resourceMatch ? resourceMatch[1] : "image";

  // Capture public_id segment after /upload/ and optional version, strip extension
  const idMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^./?]+)?$/);
  const public_id = idMatch ? decodeURIComponent(idMatch[1]) : null;

  if (!public_id) return null;
  return { public_id, resource_type };
};

const deleteCloudinaryAssets = async (urls = []) => {
  const tasks = urls
    .map((url) => parseCloudinaryUrl(url))
    .filter(Boolean)
    .map(({ public_id, resource_type }) => {
      return cloudinary.v2.uploader.destroy(public_id, {
        resource_type,
      });
    });

  if (!tasks.length) return;
  await Promise.all(tasks);
};

export const getAllProperties = async (req, res) => {
  try {
    // Pagination + search
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q.trim()}%` : null;

    // Build where clause if search provided
    let whereClause = "";
    const params = [];
    if (q) {
      params.push(q, q, q);
      whereClause = `WHERE (p.name ILIKE $1 OR p.location ILIKE $2 OR u.email ILIKE $3)`;
    }

    // total count
    const countSql = `SELECT COUNT(*) FROM properties p LEFT JOIN users u ON p.landlord_id = u.id ${whereClause}`;
    const countResult = q ? await pool.query(countSql, params) : await pool.query(countSql);
    const total = parseInt(countResult.rows[0].count, 10) || 0;

    // fetch page
     const fetchSql = `SELECT p.*, u.email as landlord_email, u.phone as landlord_phone
       FROM properties p
       LEFT JOIN users u ON p.landlord_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const fetchParams = q ? [...params, limit, offset] : [limit, offset];
    const result = await pool.query(fetchSql, fetchParams);

    const properties = result.rows.map((r) => ({
      ...r,
      images: r.images || [],
      property_doc: r.property_doc || r.propertydoc || null,
      video_url: r.video_url || null,
      landlord_phone: r.phone || r.landlord_phone || null,
    }));

    const pages = Math.ceil(total / limit) || 1;
    return res.json({ properties, total, page, pages, limit });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const approveProperty = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE properties SET is_approved = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Property not found" });
    }

    // Audit log
    await client.query(
      `INSERT INTO admin_audit(admin_id, property_id, action, details) VALUES ($1,$2,$3,$4)`,
      [req.user.id, id, "approve", JSON.stringify({ by: req.user.email || req.user.id })]
    );

    await client.query("COMMIT");
    return res.json({ property: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

export const rejectProperty = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE properties SET is_approved = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Property not found" });
    }

    // Audit log
    await client.query(
      `INSERT INTO admin_audit(admin_id, property_id, action, details) VALUES ($1,$2,$3,$4)`,
      [req.user.id, id, "reject", JSON.stringify({ by: req.user.email || req.user.id })]
    );

    await client.query("COMMIT");
    return res.json({ property: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

export const togglePublish = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE properties SET is_published = NOT COALESCE(is_published, FALSE), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Property not found" });
    }

    // Audit log
    await client.query(
      `INSERT INTO admin_audit(admin_id, property_id, action, details) VALUES ($1,$2,$3,$4)`,
      [req.user.id, id, "toggle_publish", JSON.stringify({ by: req.user.email || req.user.id, new_state: result.rows[0].is_published })]
    );

    await client.query("COMMIT");
    return res.json({ property: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const client = await pool.connect();
  let txStarted = false;

  try {
    // Fetch property + media URLs before we delete the row (needed for Cloudinary cleanup)
    const propertyRes = await client.query(
      `SELECT id, images, property_doc FROM properties WHERE id = $1`,
      [id]
    );

    if (propertyRes.rowCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const mediaRes = await client.query(
      `SELECT file_url FROM media WHERE property_id = $1 AND file_url IS NOT NULL`,
      [id]
    );

    const property = propertyRes.rows[0];
    const urls = [];

    if (Array.isArray(property.images)) {
      for (const img of property.images) {
        if (typeof img === "string") urls.push(img);
      }
    }

    const propertyDoc = property.property_doc || property.propertydoc;
    if (propertyDoc && typeof propertyDoc === "string") {
      urls.push(propertyDoc);
    }

    for (const row of mediaRes.rows) {
      if (row.file_url) urls.push(row.file_url);
    }

    const uniqueUrls = [...new Set(urls)];

    // Best-effort Cloudinary cleanup before DB delete
    try {
      await deleteCloudinaryAssets(uniqueUrls);
    } catch (cloudErr) {
      return res.status(502).json({ message: "Failed to remove media from Cloudinary" });
    }

    await client.query("BEGIN");
    txStarted = true;

    await client.query(`DELETE FROM properties WHERE id = $1`, [id]);

    await client.query("COMMIT");
    txStarted = false;

    return res.json({ message: "Property deleted" });
  } catch (err) {
    if (txStarted) {
      await client.query("ROLLBACK");
    }
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════
//  PLATFORM STATS
// ═══════════════════════════════════════════════

export const getStats = async (_req, res) => {
  try {
    const [usersR, propsR, pendingR, revenueR, txCountR] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_approved) AS approved, COUNT(*) FILTER (WHERE is_published) AS published FROM properties"),
      pool.query("SELECT COUNT(*) FROM properties WHERE is_approved = FALSE"),
      pool.query("SELECT COALESCE(SUM(total_platform_fee), 0) AS revenue FROM transactions WHERE payment_status = 'success'"),
      pool.query("SELECT COUNT(*) FROM transactions"),
    ]);

    return res.json({
      totalUsers: parseInt(usersR.rows[0].count, 10),
      totalProperties: parseInt(propsR.rows[0].total, 10),
      approvedProperties: parseInt(propsR.rows[0].approved, 10),
      publishedProperties: parseInt(propsR.rows[0].published, 10),
      pendingApprovals: parseInt(pendingR.rows[0].count, 10),
      totalTransactions: parseInt(txCountR.rows[0].count, 10),
      totalRevenue: parseFloat(revenueR.rows[0].revenue),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q.trim()}%` : null;
    const role = req.query.role || null;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (q) {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx + 1})`);
      params.push(q, q);
      idx += 2;
    }
    if (role) {
      conditions.push(`role = $${idx}`);
      params.push(role);
      idx += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countR = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countR.rows[0].count, 10);

    const fetchR = await pool.query(
      `SELECT id, full_name, email, phone, role, is_verified, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return res.json({
      users: fetchR.rows,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ["tenant", "landlord", "admin"];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(", ")}` });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role",
      [role, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════
//  TRANSACTIONS
// ═══════════════════════════════════════════════

export const getAllTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const paymentStatus = req.query.payment_status || null;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`t.status = $${idx}`);
      params.push(status);
      idx += 1;
    }
    if (paymentStatus) {
      conditions.push(`t.payment_status = $${idx}`);
      params.push(paymentStatus);
      idx += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countR = await pool.query(`SELECT COUNT(*) FROM transactions t ${where}`, params);
    const total = parseInt(countR.rows[0].count, 10);

    const fetchR = await pool.query(
      `SELECT t.*,
              p.name AS property_name, p.location AS property_location,
              buyer.full_name AS buyer_name, buyer.email AS buyer_email,
              seller.full_name AS seller_name, seller.email AS seller_email
       FROM transactions t
       LEFT JOIN properties p ON t.property_id = p.id
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return res.json({
      transactions: fetchR.rows,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════
//  AUDIT LOG
// ═══════════════════════════════════════════════

export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "30", 10)));
    const offset = (page - 1) * limit;
    const action = req.query.action || null;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (action) {
      conditions.push(`a.action = $${idx}`);
      params.push(action);
      idx += 1;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countR = await pool.query(`SELECT COUNT(*) FROM admin_audit a ${where}`, params);
    const total = parseInt(countR.rows[0].count, 10);

    const fetchR = await pool.query(
      `SELECT a.*, u.full_name AS admin_name, u.email AS admin_email,
              p.name AS property_name
       FROM admin_audit a
       LEFT JOIN users u ON a.admin_id = u.id
       LEFT JOIN properties p ON a.property_id::text = p.id::text
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return res.json({
      logs: fetchR.rows,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
