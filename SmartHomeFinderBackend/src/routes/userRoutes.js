import express from "express";
import { protect } from "../middleware/authMiddleware.js";  
import { isLandlord } from "../middleware/authMiddleware.js"; 
import { addProperty, addPropertyRequest, getPublicProperties, getPublicPropertyById, getMyProperties, updateVerifyLocation } from "../controllers/propertyController.js"; 
import { updateAvatar, getBankAccount, updateBankAccount, updateProfile } from "../controllers/authController.js";
import { getWishlist, getWishlistIds, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

// POST /api/users/properties to add a property (landlord only)
// Files are sent as base64 in the request body
router.post("/properties", protect, isLandlord, addProperty);
router.post("/property-request", protect, addPropertyRequest);

// Public: list approved & published properties for home screen
router.get("/properties", getPublicProperties);

// Authenticated user history: list own properties (landlords see their uploads; tenants will see empty)
router.get("/properties/mine", protect, getMyProperties);

// Public: single approved & published property
router.get("/properties/:id", getPublicPropertyById);

// Landlord: verify property location
router.patch("/properties/:id/verify-location", protect, isLandlord, updateVerifyLocation);

// PUT /api/users/avatar to update avatar
router.put("/avatar", protect, updateAvatar);

// PUT /api/users/profile to update basic profile
router.put("/profile", protect, updateProfile);

// Bank account
router.get("/bank-account", protect, getBankAccount);
router.put("/bank-account", protect, updateBankAccount);

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.get("/wishlist/ids", protect, getWishlistIds);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:propertyId", protect, removeFromWishlist);

export default router;
