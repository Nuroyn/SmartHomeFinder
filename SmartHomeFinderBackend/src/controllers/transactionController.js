import pool from "../config/db.js";
import { calculateFees } from "../utils/calculateFees.js";

export const createTransaction = async (req, res) => {
  try {
    const {
      property_id,
      buyer_id,
      seller_id,
      purpose,
      property_price,
    } = req.body;

    if (!property_id || !purpose || !property_price) {
      return res.status(400).json({ message: "property_id, purpose, and property_price are required" });
    }

    // Load commission rates from DB (configurable) with safe fallbacks
    let buyerRate = 0.05;
    let sellerRate = purpose === "Sell" ? 0.05 : 0;
    try {
      const rateRes = await pool.query(
        `SELECT buyer_rate, seller_rate FROM commission_settings WHERE purpose = $1 LIMIT 1`,
        [purpose]
      );
      if (rateRes.rows.length > 0) {
        buyerRate = Number(rateRes.rows[0].buyer_rate) || buyerRate;
        sellerRate = Number(rateRes.rows[0].seller_rate) || sellerRate;
      }
    } catch (rateErr) {
      // commission_settings lookup failed, using defaults
    }

    const { buyerFee, sellerFee, totalFee } = calculateFees({
      purpose,
      price: property_price,
      buyerRate,
      sellerRate,
    });

    const buyerPays = Number(property_price) + buyerFee;
    const sellerReceives = purpose === "Sell"
      ? Number(property_price) - sellerFee
      : Number(property_price); // rent: landlord gets full rent

    const result = await pool.query(
      `INSERT INTO transactions (
        property_id, buyer_id, seller_id, purpose, property_price,
        buyer_fee, seller_fee, total_platform_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        property_id,
        buyer_id || null,
        seller_id || null,
        purpose,
        property_price,
        buyerFee,
        sellerFee,
        totalFee,
      ]
    );

    return res.status(201).json({
      transaction: result.rows[0],
      payments: {
        buyerPays,
        sellerReceives,
        platformEarns: totalFee,
        buyerRate,
        sellerRate,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const listUserTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT id, property_id, buyer_id, seller_id, purpose, property_price, buyer_fee, seller_fee, total_platform_fee,
              status, payment_status, paystack_reference, created_at
       FROM transactions
       WHERE buyer_id = $1 OR seller_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    return res.json({ transactions: result.rows });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
