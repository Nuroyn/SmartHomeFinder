import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import crypto from "crypto";
import { provisionVirtualAccountForUser } from "./paymentsController.js";



// Helper to generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, full_name, email, phone, password, role } = req.body;
    const userRole = role || 'tenant';
    const displayName = full_name || name;

    // Basic validation
    if (!displayName || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required" });
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check existing user
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const phoneExists = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (phoneExists.rows.length > 0) {
      return res.status(409).json({ message: "Phone already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role, created_at, is_verified`,
      [displayName, email, phone, passwordHash, userRole]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    let virtualAccount = null;
    try {
      virtualAccount = await provisionVirtualAccountForUser(user.id);
    } catch (vaErr) {
      // virtual account provisioning is non-critical
    }

    return res.status(201).json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url,
        role: user.role || 'tenant',
        created_at: user.created_at,
        verified: user.is_verified || false,
        bank_account_name: virtualAccount?.account_name || null,
        bank_name: virtualAccount?.bank_name || null,
        bank_account_number: virtualAccount?.account_number || null,
        paystack_customer_code: virtualAccount?.customer_code || null,
        paystack_dedicated_account_id: virtualAccount?.dedicated_account_id || null,
        paystack_preferred_bank: virtualAccount?.preferred_bank || null,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    let virtualAccount = null;
    try {
      virtualAccount = await provisionVirtualAccountForUser(user.id);
    } catch (vaErr) {
      // virtual account provisioning is non-critical
    }

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url,
        role: user.role,
        verified: user.is_verified,
        bank_account_name: virtualAccount?.account_name || user.bank_account_name || null,
        bank_name: virtualAccount?.bank_name || user.bank_name || null,
        bank_account_number: virtualAccount?.account_number || user.bank_account_number || null,
        paystack_customer_code: virtualAccount?.customer_code || user.paystack_customer_code || null,
        paystack_dedicated_account_id: virtualAccount?.dedicated_account_id || user.paystack_dedicated_account_id || null,
        paystack_preferred_bank: virtualAccount?.preferred_bank || user.paystack_preferred_bank || null,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const result = await pool.query(
      `SELECT id, full_name, email, phone, created_at, role, is_verified
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        role: user.role,
        verified: user.is_verified
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Update Avatar
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body; // base64 image or URL
    const userId = req.user.id;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar data is required" });
    }

    const result = await pool.query(
      `UPDATE users
       SET avatar_url = $1
       WHERE id = $2
       RETURNING id, full_name, email, avatar_url, role, is_verified`,
      [avatar, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar: user.avatar_url,
        role: user.role,
        verified: user.is_verified
      },
      message: "Avatar updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Update basic profile fields
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (phone) {
      const phoneExists = await pool.query("SELECT id FROM users WHERE phone = $1 AND id <> $2", [phone, userId]);
      if (phoneExists.rows.length > 0) {
        return res.status(409).json({ message: "Phone already in use" });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, full_name, email, phone, avatar_url, role, is_verified, bank_account_name, bank_account_number, bank_name, paystack_customer_code, paystack_dedicated_account_id, paystack_preferred_bank` ,
      [full_name, phone || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        verified: user.is_verified,
        bank_account_name: user.bank_account_name,
        bank_name: user.bank_name,
        bank_account_number: user.bank_account_number,
        paystack_customer_code: user.paystack_customer_code,
        paystack_dedicated_account_id: user.paystack_dedicated_account_id,
        paystack_preferred_bank: user.paystack_preferred_bank,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get Bank Account (stored on user record)
export const getBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT bank_account_name, bank_name, bank_account_number, bank_edit_count
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = result.rows[0];
    return res.json({
      bankAccount: {
        accountName: row.bank_account_name || "",
        bankName: row.bank_name || "",
        accountNumber: row.bank_account_number || "",
        editCount: row.bank_edit_count || 0,
        locked: (row.bank_edit_count || 0) >= 3,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Update Bank Account (limited edits)
export const updateBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountName, bankName, accountNumber } = req.body;

    if (!accountName || !bankName || !accountNumber) {
      return res.status(400).json({ message: "Account name, bank name, and account number are required" });
    }

    const current = await pool.query(
      `SELECT bank_edit_count FROM users WHERE id = $1`,
      [userId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const edits = current.rows[0].bank_edit_count || 0;
    if (edits >= 3) {
      return res.status(403).json({ message: "Bank details locked. Please request another edit." });
    }

    const result = await pool.query(
      `UPDATE users
       SET bank_account_name = $1,
           bank_name = $2,
           bank_account_number = $3,
           bank_edit_count = COALESCE(bank_edit_count, 0) + 1,
           updated_at = NOW()
       WHERE id = $4
       RETURNING bank_account_name, bank_name, bank_account_number, bank_edit_count`,
      [accountName, bankName, accountNumber, userId]
    );

    const row = result.rows[0];

    return res.json({
      bankAccount: {
        accountName: row.bank_account_name || "",
        bankName: row.bank_name || "",
        accountNumber: row.bank_account_number || "",
        editCount: row.bank_edit_count || 0,
        locked: (row.bank_edit_count || 0) >= 3,
      },
      message: "Bank details saved",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const userRes = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(200).json({
        message: "If the email exists, a reset link was sent",
      });
    }

    const user = userRes.rows[0];

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Reset link (in production, send via email instead of logging)
    const resetBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${resetBaseUrl}/reset-password/${rawToken}`;

    // TODO: replace with email service
    if (process.env.NODE_ENV !== "production") {
      console.log("RESET LINK:", resetLink);
    }

    return res.json({
      message: "Password reset link sent",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const resets = await pool.query(
      `SELECT * FROM password_resets
       WHERE used = false AND expires_at > NOW()`
    );

    let matchedReset = null;

    for (const reset of resets.rows) {
      const isMatch = await bcrypt.compare(token, reset.token_hash);
      if (isMatch) {
        matchedReset = reset;
        break;
      }
    }

    if (!matchedReset) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, matchedReset.user_id]
    );

    await pool.query(
      "UPDATE password_resets SET used = true WHERE id = $1",
      [matchedReset.id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


