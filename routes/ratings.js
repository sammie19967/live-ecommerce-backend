import express from "express";
import { ratePost, getPostRating } from "../controllers/ratingController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // Ensuring user authentication

const router = express.Router();

// Rate a post
router.post("/:postId", authenticate, ratePost);

// Get average rating for a post
router.get("/:postId", getPostRating);

export default router;
