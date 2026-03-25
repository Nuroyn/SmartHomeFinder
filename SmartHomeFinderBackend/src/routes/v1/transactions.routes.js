import express from "express";
import { listUserTransactions } from "../../controllers/transactionController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/my", protect, listUserTransactions);

export default router;
