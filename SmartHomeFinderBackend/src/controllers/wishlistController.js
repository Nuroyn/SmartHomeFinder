import pool from "../config/db.js";

// GET /api/users/wishlist — list user's wishlisted properties
export const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id AS wishlist_id, w.created_at AS wishlisted_at, p.*
       FROM wishlists w
       JOIN properties p ON p.id = w.property_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    return res.json({ wishlist: result.rows });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/wishlist/ids — lightweight: just property IDs
export const getWishlistIds = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT property_id FROM wishlists WHERE user_id = $1`,
      [req.user.id]
    );
    return res.json({ ids: result.rows.map((r) => r.property_id) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/wishlist — add property to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { property_id } = req.body;
    if (!property_id) {
      return res.status(400).json({ message: "property_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO wishlists (user_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING
       RETURNING *`,
      [req.user.id, property_id]
    );

    if (result.rowCount === 0) {
      return res.json({ message: "Already in wishlist" });
    }

    return res.status(201).json({ message: "Added to wishlist", item: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/users/wishlist/:propertyId — remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    await pool.query(
      `DELETE FROM wishlists WHERE user_id = $1 AND property_id = $2`,
      [req.user.id, propertyId]
    );
    return res.json({ message: "Removed from wishlist" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
