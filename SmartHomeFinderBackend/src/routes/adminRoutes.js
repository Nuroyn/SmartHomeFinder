import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAllProperties,
  approveProperty,
  rejectProperty,
  togglePublish,
  deleteProperty,
  getStats,
  getAllUsers,
  updateUserRole,
  getAllTransactions,
  getAuditLogs,
} from "../controllers/adminController.js";

const router = express.Router();

// ── Stats ──
router.get("/stats", protect, isAdmin, getStats);

// ── Properties ──
router.get("/properties", protect, isAdmin, getAllProperties);
router.put("/properties/:id/approve", protect, isAdmin, approveProperty);
router.put("/properties/:id/reject", protect, isAdmin, rejectProperty);
router.put("/properties/:id/toggle-publish", protect, isAdmin, togglePublish);
router.delete("/properties/:id", protect, isAdmin, deleteProperty);

// ── Users ──
router.get("/users", protect, isAdmin, getAllUsers);
router.put("/users/:id/role", protect, isAdmin, updateUserRole);

// ── Transactions ──
router.get("/transactions", protect, isAdmin, getAllTransactions);

// ── Audit Logs ──
router.get("/audit-logs", protect, isAdmin, getAuditLogs);

export default router;
