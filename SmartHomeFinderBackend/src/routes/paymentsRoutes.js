import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { initiatePaystackPayment, verifyPaystackPayment, createVirtualAccount, getCards, addCard } from "../controllers/paymentsController.js";

const router = express.Router();

router.get("/cards", protect, getCards);
router.post("/cards", protect, addCard);
router.post("/paystack/initiate", protect, initiatePaystackPayment);
router.get("/verify", verifyPaystackPayment);
router.post("/paystack/virtual-account", protect, createVirtualAccount);

export default router;
