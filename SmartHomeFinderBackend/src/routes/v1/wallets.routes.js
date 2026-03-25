import express from "express";

const router = express.Router();

// Placeholder v1 wallets routes. Wire to controller/service when available.
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
