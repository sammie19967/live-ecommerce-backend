import Like from "../models/Like.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Like a post
export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if the post exists
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user already liked the post
        const existingLike = await Like.findOne({ where: { postId, userId } });
        if (existingLike) {
            return res.status(400).json({ message: "You already liked this post" });
        }

        // Create a new like
        await Like.create({ postId, userId });

        res.status(201).json({ message: "Post liked successfully" });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Unlike a post
export const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const like = await Like.findOne({ where: { postId, userId } });
        if (!like) {
            return res.status(400).json({ message: "You haven't liked this post" });
        }

        await like.destroy();
        res.json({ message: "Post unliked successfully" });
    } catch (error) {
        console.error("Error unliking post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get total likes for a post
export const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        const totalLikes = await Like.count({ where: { postId } });

        res.json({ postId, totalLikes });
    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
