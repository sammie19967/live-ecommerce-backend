import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    toggleFollow,
    getFollowersCount,
    getFollowingCount,
    getFollowers,
    getFollowing
} from "../controllers/followerControler.js";

const router = express.Router();

// Follow/Unfollow user (toggle action)
router.post("/follow/:userId", authenticate, toggleFollow);

// Get count of followers for a user
router.get("/followers/:userId/count", getFollowersCount);

// Get count of users a user is following
router.get("/following/:userId/count", getFollowingCount);

// Get list of followers for a user
router.get("/followers/:userId", getFollowers);

// Get list of users a user is following
router.get("/following/:userId", getFollowing);

export default router;
