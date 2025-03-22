import express from "express";
import { likePost, unlikePost, getPostLikes } from "../controllers/likeController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // Ensure user authentication

const router = express.Router();

// Like a post
router.post("/:postId", authenticate, likePost);

// Unlike a post
router.delete("/:postId", authenticate, unlikePost);

// Get total likes for a post
router.get("/:postId", getPostLikes);

export default router;
