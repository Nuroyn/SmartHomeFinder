import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { createTransaction } from "../controllers/transactionController.js";

const router = express.Router();

// Admin creates a transaction record (can be extended later for escrow integrations)
router.post("/", protect, isAdmin, createTransaction);

export default router;
