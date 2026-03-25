import pool from "../config/db.js";

// Helper to convert Base64 → buffer + metadata
function parseBase64File(str) {
  if (!str) return null;

  const matches = str.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  const mime = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  return {
    mimeType: mime,
    buffer,
    fileSize: buffer.length,
  };
}

// Simple URL checker for Cloudinary/HTTP assets
const isHttpUrl = (str) => typeof str === "string" && /^https?:\/\//i.test(str);

// Function to add a property
export const addProperty = async (req, res) => {
  const {
    name,
    description,
    price,
    location,
    propertyType,
    purpose,
    yearBuilt,
    numBedrooms,
    numBathrooms,
    landSize,
    verifyLocation,
    hasGarage,
    images,
    video_url,
    propertyDoc,
  } = req.body;

  // Basic validation
  if (!name || typeof name !== "string" || name.length > 255) {
    return res.status(400).json({ message: "Property name is required (max 255 chars)" });
  }
  if (description && description.length > 5000) {
    return res.status(400).json({ message: "Description exceeds 5000 characters" });
  }
  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ message: "Valid price is required" });
  }
  if (!location || typeof location !== "string" || location.length > 500) {
    return res.status(400).json({ message: "Location is required (max 500 chars)" });
  }

  const landlordId = req.user.id;

  const client = await pool.connect(); // Use pool here instead of db
  try {
    await client.query("BEGIN");

    // Insert into properties table
    const insertPropertyQuery = `
      INSERT INTO properties(
        landlord_id, name, description, price, location,
        property_type, purpose, year_built, num_bedrooms,
        num_bathrooms, land_size, verify_location,
        has_garage, images
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id
    `;

    const propertyValues = [
      landlordId, name, description, price, location,
      propertyType, purpose, yearBuilt, numBedrooms || 0,
      numBathrooms || 0, landSize, verifyLocation,
      hasGarage || false, Array.isArray(images) ? images : []
    ];

    const propertyResult = await client.query(insertPropertyQuery, propertyValues);
    const propertyId = propertyResult.rows[0].id;

    // ==========================
    // MEDIA INSERTION START
    // ==========================

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        const parsed = parseBase64File(img);
        const url = !parsed && isHttpUrl(img) ? img : null;
        if (!parsed && !url) continue;

        await client.query(
          `INSERT INTO media(property_id, file_type, mime_type, file_size, file_url)
           VALUES ($1, 'image', $2, $3, $4)`,
          [
            propertyId,
            parsed ? parsed.mimeType : null,
            parsed ? parsed.fileSize : null,
            url,
          ]
        );
      }
    }

    // Insert Video
    if (video_url) {
      const parsedVideo = parseBase64File(video_url);
      const url = !parsedVideo && isHttpUrl(video_url) ? video_url : null;

      if (parsedVideo || url) {
        await client.query(
          `INSERT INTO media(property_id, file_type, mime_type, file_size, file_url)
           VALUES ($1, 'video', $2, $3, $4)`,
          [
            propertyId,
            parsedVideo ? parsedVideo.mimeType : null,
            parsedVideo ? parsedVideo.fileSize : null,
            url,
          ]
        );
      }
    }

    // Insert Document
    if (propertyDoc) {
      const parsedDoc = parseBase64File(propertyDoc);
      const url = !parsedDoc && isHttpUrl(propertyDoc) ? propertyDoc : null;

      if (parsedDoc || url) {
        await client.query(
          `INSERT INTO media(property_id, file_type, mime_type, file_size, file_url)
           VALUES ($1, 'document', $2, $3, $4)`,
          [
            propertyId,
            parsedDoc ? parsedDoc.mimeType : null,
            parsedDoc ? parsedDoc.fileSize : null,
            url,
          ]
        );
      }
    }

    // ==========================
    // MEDIA INSERTION END
    // ==========================

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Property created successfully",
      propertyId,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// Submit a property request
export const addPropertyRequest = async (req, res) => {
  try {
    const {
      propertyType,
      requestPropertyLocation,
      briefDescription,
      state,
      lga,
      townCity,
      purpose,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (
      !propertyType ||
      !requestPropertyLocation ||
      !briefDescription ||
      !state ||
      !lga ||
      !townCity ||
      !purpose
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // INSERT request into database
    const result = await pool.query(
      `INSERT INTO property_requests 
        (user_id, property_type, request_property_location, brief_description, state, lga, town_city, purpose)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        propertyType,
        requestPropertyLocation,
        briefDescription,
        state,
        lga,
        townCity,
        purpose,
      ]
    );

    const newRequest = result.rows[0];

    return res.status(201).json({
      message: "Property request submitted successfully",
      request: newRequest,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Public: get approved and published properties for home screen
// Supports query params: q (search), purpose, minPrice, maxPrice, page, limit
export const getPublicProperties = async (req, res) => {
  const {
    q = "",
    purpose = "",
    minPrice = "",
    maxPrice = "",
    page = "1",
    limit = "20",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [
    "COALESCE(p.is_published, FALSE) = TRUE",
    "COALESCE(p.is_approved, FALSE) = TRUE",
  ];
  const values = [];

  if (q.trim()) {
    values.push(`%${q.trim()}%`);
    const idx = values.length;
    conditions.push(`(p.name ILIKE $${idx} OR p.location ILIKE $${idx})`);
  }

  if (purpose && purpose !== "any") {
    values.push(purpose);
    conditions.push(`p.purpose = $${values.length}`);
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    values.push(Number(minPrice));
    conditions.push(`p.price >= $${values.length}`);
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    values.push(Number(maxPrice));
    conditions.push(`p.price <= $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const baseSelect = `SELECT p.*, u.email as landlord_email
    FROM properties p
    LEFT JOIN users u ON p.landlord_id = u.id`;

  const countSql = `SELECT COUNT(*) FROM properties p LEFT JOIN users u ON p.landlord_id = u.id ${whereClause}`;
  const dataSql = `${baseSelect} ${whereClause} ORDER BY p.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

  try {
    const countResult = await pool.query(countSql, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(dataSql, [...values, limitNum, offset]);

    const properties = dataResult.rows.map((r) => ({
      ...r,
      images: r.images || [],
      property_doc: r.property_doc || r.propertydoc || null,
      video_url: r.video_url || null,
    }));

    return res.json({
      properties,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    // If columns are missing (older schema), fall back to unfiltered query
    if (err.code === "42703") {
      try {
        const fallbackSql = `${baseSelect} ORDER BY p.created_at DESC`;
        const result = await pool.query(fallbackSql);
        const properties = result.rows.map((r) => ({
          ...r,
          images: r.images || [],
          property_doc: r.property_doc || r.propertydoc || null,
          video_url: r.video_url || null,
        }));
        return res.json({ properties, total: properties.length, page: 1, pages: 1, limit: properties.length });
      } catch (fallbackErr) {
        return res.status(500).json({ message: "Server error" });
      }
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Public: get a single approved & published property by id
export const getPublicPropertyById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid property id" });

  const baseSelect = `SELECT p.*, u.email as landlord_email
    FROM properties p
    LEFT JOIN users u ON p.landlord_id = u.id
    WHERE p.id = $1`;

  const filteredSql = `${baseSelect}
    AND COALESCE(p.is_published, FALSE) = TRUE
    AND COALESCE(p.is_approved, FALSE) = TRUE
    LIMIT 1`;

  try {
    let result;
    try {
      result = await pool.query(filteredSql, [id]);
    } catch (err) {
      if (err.code === "42703") {
        const fallbackSql = `${baseSelect} LIMIT 1`;
        result = await pool.query(fallbackSql, [id]);
      } else {
        throw err;
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const r = result.rows[0];
    const property = {
      ...r,
      images: r.images || [],
      property_doc: r.property_doc || r.propertydoc || null,
      video_url: r.video_url || null,
    };

    // Attempt to pull a video file_url from media table when not present on properties row
    if (!property.video_url) {
      try {
        const mediaRes = await pool.query(
          `SELECT file_url FROM media WHERE property_id = $1 AND file_type = 'video' AND file_url IS NOT NULL LIMIT 1`,
          [id]
        );
        if (mediaRes.rows.length > 0) {
          property.video_url = mediaRes.rows[0].file_url;
        }
      } catch (mediaErr) {
        // media lookup failed, video_url stays null
      }
    }

    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Landlord: get own properties (history)
export const getMyProperties = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT p.*, u.email as landlord_email
       FROM properties p
       LEFT JOIN users u ON p.landlord_id = u.id
       WHERE p.landlord_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const properties = result.rows.map((r) => ({
      ...r,
      images: r.images || [],
      property_doc: r.property_doc || r.propertydoc || null,
      video_url: r.video_url || null,
    }));

    return res.json({ properties, total: properties.length });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Landlord: verify location (captures lat/long and stores as verify_location)
export const updateVerifyLocation = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: "Latitude and longitude are required" });
  }

  const verifyLocation = `${latitude},${longitude}`;

  try {
    const result = await pool.query(
      `UPDATE properties
       SET verify_location = $1, updated_at = NOW()
       WHERE id = $2 AND landlord_id = $3
       RETURNING *`,
      [verifyLocation, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Property not found or not owned by user" });
    }

    const property = result.rows[0];
    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
