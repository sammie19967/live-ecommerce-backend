import Follower from "../models/Followers.js";
import User from "../models/User.js";

/**
 * @desc    Follow or Unfollow a user
 * @route   POST /api/follow/:userId
 * @access  Private (Authenticated users only)
 */
export const toggleFollow = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        if (followerId === userId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        // Ensure target user exists
        const targetUser = await User.findByPk(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already following
        const existingFollow = await Follower.findOne({ where: { followerId, followingId: userId } });

        if (existingFollow) {
            // Unfollow if already following
            await existingFollow.destroy();
            return res.status(200).json({ message: "User unfollowed successfully." });
        }

        // Follow the user
        await Follower.create({ followerId, followingId: userId });
        res.status(200).json({ message: "User followed successfully." });
    } catch (error) {
        console.error("❌ Follow Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get followers count for a user
 * @route   GET /api/followers/:userId/count
 * @access  Public
 */
export const getFollowersCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await Follower.count({ where: { followingId: userId } });
        res.status(200).json({ userId, followersCount: count });
    } catch (error) {
        console.error("❌ Followers Count Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get following count for a user
 * @route   GET /api/following/:userId/count
 * @access  Public
 */
export const getFollowingCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await Follower.count({ where: { followerId: userId } });
        res.status(200).json({ userId, followingCount: count });
    } catch (error) {
        console.error("❌ Following Count Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get list of followers for a user
 * @route   GET /api/followers/:userId
 * @access  Public
 */
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const followers = await Follower.findAll({
            where: { followingId: userId },
            include: [{ model: User, as: "follower", attributes: ["id", "username", "email"] }]
        });
        res.status(200).json({ userId, followers });
    } catch (error) {
        console.error("❌ Fetch Followers Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get list of users a user is following
 * @route   GET /api/following/:userId
 * @access  Public
 */
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const following = await Follower.findAll({
            where: { followerId: userId },
            include: [{ model: User, as: "following", attributes: ["id", "username", "email"] }]
        });
        res.status(200).json({ userId, following });
    } catch (error) {
        console.error("❌ Fetch Following Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
