// routes/authRoutes.js
import express from "express";
import { registerUser, 
    loginUser, 
    getProfile,
forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { updateAvatar} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/avatar", protect, updateAvatar);

// POST /api/auth/signup
router.post("/signup", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// GET /api/auth/profile
router.get("/profile", protect, getProfile);

export default router;
