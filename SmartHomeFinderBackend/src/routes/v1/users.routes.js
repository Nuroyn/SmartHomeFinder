import express from "express";
import { protect, isLandlord } from "../../middleware/authMiddleware.js";
import {
  addProperty,
  addPropertyRequest,
  getPublicProperties,
  getPublicPropertyById,
  getMyProperties,
  updateVerifyLocation,
} from "../../controllers/propertyController.js";

const router = express.Router();

// Landlord creates property
router.post("/properties", protect, isLandlord, addProperty);
// Public listings
router.get("/properties", getPublicProperties);
router.get("/properties/:id", getPublicPropertyById);
// Authenticated landlord history + verify
router.get("/properties/mine", protect, getMyProperties);
router.patch("/properties/:id/verify-location", protect, isLandlord, updateVerifyLocation);
// Property request (any authenticated user)
router.post("/property-request", protect, addPropertyRequest);

export default router;
