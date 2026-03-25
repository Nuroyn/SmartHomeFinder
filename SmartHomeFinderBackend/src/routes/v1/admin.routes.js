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

router.get("/properties", protect, isAdmin, getAllProperties);
router.put("/properties/:id/approve", protect, isAdmin, approveProperty);
router.put("/properties/:id/reject", protect, isAdmin, rejectProperty);
router.put("/properties/:id/toggle-publish", protect, isAdmin, togglePublish);
router.delete("/properties/:id", protect, isAdmin, deleteProperty);

export default router;
