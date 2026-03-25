import pool from "../config/db.js";
import { calculateFees } from "../utils/calculateFees.js";

// Initiate Paystack payment and create a pending transaction row
export const initiatePaystackPayment = async (req, res) => {
  try {
    const { property_id } = req.body;
    if (!property_id) {
      return res.status(400).json({ message: "property_id is required" });
    }

    // Fetch property to ensure correct price/purpose/landlord
    const propRes = await pool.query(
      `SELECT id, price, purpose, landlord_id FROM properties WHERE id = $1 LIMIT 1`,
      [property_id]
    );

    if (propRes.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propRes.rows[0];
    const amount = Number(property.price) || 0;

    // Commission rates (configurable)
    let buyerRate = 0.05;
    let sellerRate = property.purpose === "Sell" ? 0.05 : 0;
    try {
      const rateRes = await pool.query(
        `SELECT buyer_rate, seller_rate FROM commission_settings WHERE purpose = $1 LIMIT 1`,
        [property.purpose]
      );
      if (rateRes.rows.length > 0) {
        buyerRate = Number(rateRes.rows[0].buyer_rate) || buyerRate;
        sellerRate = Number(rateRes.rows[0].seller_rate) || sellerRate;
      }
    } catch (rateErr) {
      // commission_settings lookup failed, using defaults
    }

    const { buyerFee, sellerFee, totalFee } = calculateFees({
      purpose: property.purpose,
      price: amount,
      buyerRate,
      sellerRate,
    });

    const buyerPays = amount + buyerFee;
    const sellerReceives = property.purpose === "Sell" ? amount - sellerFee : amount;

    const reference = `shf_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const currency = "NGN";

    // Call Paystack initialize
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: "PAYSTACK_SECRET_KEY not set" });
    }

    const payload = {
      email: req.user?.email || "customer@example.com",
      amount: Math.round(buyerPays * 100), // kobo
      currency,
      reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:5002/api/payments/verify",
      metadata: {
        property_id,
        buyer_id: req.user?.id || null,
        seller_id: property.landlord_id,
        purpose: property.purpose,
      },
    };

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!initRes.ok) {
      const text = await initRes.text();
      return res.status(initRes.status).json({ message: "Payment initialization failed" });
    }

    const initJson = await initRes.json();
    const authorizationUrl = initJson?.data?.authorization_url;

    // Create transaction row
    const txRes = await pool.query(
      `INSERT INTO transactions (
        property_id, buyer_id, seller_id, purpose, property_price,
        buyer_fee, seller_fee, total_platform_fee,
        payment_status, paystack_reference, currency
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        property_id,
        req.user?.id || null,
        property.landlord_id || null,
        property.purpose,
        amount,
        buyerFee,
        sellerFee,
        totalFee,
        "pending",
        reference,
        currency,
      ]
    );

    return res.status(201).json({
      authorizationUrl,
      reference,
      transaction: txRes.rows[0],
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

// Create or return a dedicated virtual account for the authenticated user
export const provisionVirtualAccountForUser = async (userId, preferredBankInput) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY not set");
  if (!userId) throw new Error("User ID is required to provision a virtual account");

  const userRes = await pool.query(
    `SELECT id, full_name, email, phone, bank_account_name, bank_name, bank_account_number, paystack_customer_code, paystack_dedicated_account_id, paystack_preferred_bank
     FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userRes.rows[0];

  if (user.bank_account_number && user.bank_name) {
    return {
      existed: true,
      account_number: user.bank_account_number,
      bank_name: user.bank_name,
      account_name: user.bank_account_name || user.full_name,
      customer_code: user.paystack_customer_code || null,
      dedicated_account_id: user.paystack_dedicated_account_id || null,
      preferred_bank: user.paystack_preferred_bank || preferredBankInput || null,
    };
  }

  let customerCode = user.paystack_customer_code;
  if (!customerCode) {
    const [firstName, ...rest] = (user.full_name || "Customer User").split(" ");
    const lastName = rest.join(" ") || firstName;

    const customerRes = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone: user.phone || undefined,
      }),
    });

    if (!customerRes.ok) {
      const text = await customerRes.text();
      throw new Error(`Paystack customer create failed: ${text}`);
    }

    const customerJson = await customerRes.json();
    customerCode = customerJson?.data?.customer_code;
    if (!customerCode) {
      throw new Error("Missing customer_code from Paystack");
    }
  }

  const preferredBank = preferredBankInput || user.paystack_preferred_bank || "wema-bank";
  const dvaRes = await fetch("https://api.paystack.co/dedicated_account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerCode,
      preferred_bank: preferredBank,
      single_use: false,
    }),
  });

  if (!dvaRes.ok) {
    const text = await dvaRes.text();
    throw new Error(`Paystack dedicated account create failed: ${text}`);
  }

  const dvaJson = await dvaRes.json();
  const data = dvaJson?.data;
  const accountNumber = data?.account_number;
  const bankName = data?.bank?.name;
  const accountName = data?.account_name;
  const dedicatedAccountId = data?.id;

  if (!accountNumber || !bankName) {
    throw new Error("Missing account details from Paystack");
  }

  const updateRes = await pool.query(
    `UPDATE users
     SET bank_account_name = COALESCE($1, bank_account_name),
         bank_name = $2,
         bank_account_number = $3,
         bank_edit_count = bank_edit_count + 1,
         paystack_customer_code = $4,
         paystack_dedicated_account_id = $5,
         paystack_preferred_bank = $6
     WHERE id = $7
     RETURNING id, full_name, email, bank_account_name, bank_name, bank_account_number, paystack_customer_code, paystack_dedicated_account_id, paystack_preferred_bank`,
    [accountName || user.bank_account_name || user.full_name, bankName, accountNumber, customerCode, dedicatedAccountId, preferredBank, userId]
  );

  const updated = updateRes.rows[0];

  return {
    existed: false,
    account_number: updated.bank_account_number,
    bank_name: updated.bank_name,
    account_name: updated.bank_account_name,
    customer_code: updated.paystack_customer_code,
    dedicated_account_id: updated.paystack_dedicated_account_id,
    preferred_bank: updated.paystack_preferred_bank,
  };
};

export const createVirtualAccount = async (req, res) => {
  try {
    const info = await provisionVirtualAccountForUser(req.user?.id, req.body?.preferred_bank);
    const status = info.existed ? 200 : 201;
    return res.status(status).json(info);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// List saved payment cards (Paystack authorizations) for the authenticated user
export const getCards = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: "PAYSTACK_SECRET_KEY not set" });
    }

    const userRes = await pool.query(
      `SELECT paystack_customer_code FROM users WHERE id = $1 LIMIT 1`,
      [req.user.id]
    );
    const customerCode = userRes.rows[0]?.paystack_customer_code;
    if (!customerCode) {
      return res.json({ cards: [] });
    }

    const custRes = await fetch(
      `https://api.paystack.co/customer/${encodeURIComponent(customerCode)}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    if (!custRes.ok) {
      return res.status(custRes.status).json({ message: "Failed to fetch customer" });
    }

    const custJson = await custRes.json();
    const authorizations = (custJson?.data?.authorizations || []).map((a) => ({
      authorization_code: a.authorization_code,
      bin: a.bin,
      last4: a.last4,
      exp_month: a.exp_month,
      exp_year: a.exp_year,
      card_type: a.card_type,
      bank: a.bank,
      brand: a.brand,
      reusable: a.reusable,
      signature: a.signature,
    }));

    return res.json({ cards: authorizations });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Initialize a small charge to tokenise / save a new card
export const addCard = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: "PAYSTACK_SECRET_KEY not set" });
    }

    // Ensure a Paystack customer exists for the user
    let userRes = await pool.query(
      `SELECT email, paystack_customer_code FROM users WHERE id = $1 LIMIT 1`,
      [req.user.id]
    );
    let customerCode = userRes.rows[0]?.paystack_customer_code;

    if (!customerCode) {
      // provisionVirtualAccountForUser creates a Paystack customer as a side-effect
      const info = await provisionVirtualAccountForUser(req.user.id);
      customerCode = info.customer_code;
    }

    const email = userRes.rows[0]?.email || req.user.email;
    const reference = `card_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: 5000, // NGN 50 (smallest chargeable in kobo)
        currency: "NGN",
        reference,
        channels: ["card"],
        metadata: { purpose: "card_tokenization", user_id: req.user.id },
      }),
    });

    if (!initRes.ok) {
      return res.status(initRes.status).json({ message: "Card initialization failed" });
    }

    const initJson = await initRes.json();
    return res.status(201).json({
      authorization_url: initJson?.data?.authorization_url,
      reference,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify Paystack payment using reference and update the transaction record
export const verifyPaystackPayment = async (req, res) => {
  try {
    const reference = req.query.reference || req.body?.reference || req.body?.data?.reference;
    if (!reference) {
      return res.status(400).json({ message: "reference is required" });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: "PAYSTACK_SECRET_KEY not set" });
    }

    const txLookup = await pool.query(
      `SELECT id, property_price, buyer_fee, payment_status FROM transactions WHERE paystack_reference = $1 LIMIT 1`,
      [reference]
    );
    if (txLookup.rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found for reference" });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (!verifyRes.ok) {
      return res.status(verifyRes.status).json({ message: "Payment verification failed" });
    }

    const verifyJson = await verifyRes.json();
    const data = verifyJson?.data;
    const paymentStatus = data?.status || "failed";
    const currency = data?.currency || "NGN";

    const expectedKobo = Math.round((Number(txLookup.rows[0].property_price) + Number(txLookup.rows[0].buyer_fee)) * 100);
    const paidKobo = Number(data?.amount) || null;
    const amountMismatch = paidKobo && expectedKobo && paidKobo !== expectedKobo;

    const updateRes = await pool.query(
      `UPDATE transactions
       SET payment_status = $1,
           status = $2,
           currency = COALESCE($3, currency),
           paid_at = CASE WHEN $1 = 'success' THEN NOW() ELSE paid_at END
       WHERE paystack_reference = $4
       RETURNING *`,
      [paymentStatus, paymentStatus, currency, reference]
    );

    return res.json({
      message: amountMismatch ? "Verified but amount mismatch" : "Payment verified",
      transaction: updateRes.rows[0],
      paystack: data,
      mismatch: amountMismatch ? { expectedKobo, paidKobo } : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
