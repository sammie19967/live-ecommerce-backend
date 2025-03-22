import Post from "../models/Post.js";
import User from "../models/User.js";

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.user.id; // Assuming user is authenticated

        if (!mediaUrl || !mediaType) {
            return res.status(400).json({ message: "Media is required." });
        }

        const post = await Post.create({
            caption,
            mediaUrl,
            mediaType,
            userId,
        });

        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all posts (with pagination)
export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const posts = await Post.findAndCountAll({
            include: [{ model: User, attributes: ["id", "username"] }],
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({ 
            totalPosts: posts.count, 
            currentPage: page, 
            totalPages: Math.ceil(posts.count / limit),
            posts: posts.rows 
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get post by ID
export const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findOne({
            where: { id: postId },
            include: [{ model: User, attributes: ["id", "username"] }],
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get posts by logged-in user
export const getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await Post.findAll({
            where: { userId },
            include: [{ model: User, attributes: ["id", "username"] }],
            order: [["createdAt", "DESC"]],
        });

        res.json(posts);
    } catch (error) {
        console.error("Error fetching user's posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.user.id;

        const post = await Post.findOne({ where: { id: postId, userId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found or unauthorized" });
        }

        post.caption = caption || post.caption;
        post.mediaUrl = mediaUrl || post.mediaUrl;
        post.mediaType = mediaType || post.mediaType;

        await post.save();
        res.json({ message: "Post updated successfully", post });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findOne({ where: { id: postId, userId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found or unauthorized" });
        }

        await post.destroy();
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
