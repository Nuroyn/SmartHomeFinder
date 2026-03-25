import express from "express";
import { protect, isAdmin } from "../../middleware/authMiddleware.js";
import {
  approveProperty,
  deleteProperty,
  getAllProperties,
  rejectProperty,
  togglePublish,
} from "../../controllers/adminController.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllProperties);
router.put("/:id/approve", protect, isAdmin, approveProperty);
router.put("/:id/reject", protect, isAdmin, rejectProperty);
router.put("/:id/toggle-publish", protect, isAdmin, togglePublish);
router.delete("/:id", protect, isAdmin, deleteProperty);

export default router;
