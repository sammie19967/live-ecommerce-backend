import Comment from '../models/Comment.js';
import LiveStream from '../models/Livestream.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Create a new comment
export const addComment = async (req, res) => {
    try {
        const { streamId, text } = req.body;
        const userId = req.user.id; // Assuming user authentication is set up


        // Check if the livestream exists and is active
        const stream = await LiveStream.findOne({ where: { id: streamId, isActive: true } });
        if (!stream) {
            return res.status(400).json({ message: 'This livestream is not active or does not exist.' });
        }

        // Create the comment
        const comment = await Comment.create({
            text,
            userId,
            streamId
        });

        return res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all comments (Optional: Filter by stream ID)
export const getComments = async (req, res) => {
    try {
        const { streamId } = req.query; // Optional query parameter
        const whereClause = streamId ? { streamId } : {};

        const comments = await Comment.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['id', 'username'] }] // Include user details
        });

        return res.json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all comments (Optional: Filter by post ID)
export const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.query; // Optional query parameter
        const whereClause = postId ? { postId } : {};

        const comments = await Comment.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['id', 'username'] }] // Include user details
        });

        return res.json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get a single comment by ID
export const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByPk(id, {
            include: [{ model: User, attributes: ['id', 'username'] }]
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        return res.json(comment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a comment (Only by the owner)
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this comment' });
        }

        comment.text = text || comment.text;
        await comment.save();

        return res.json({ message: 'Comment updated', comment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a comment (Only by owner or admin)
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Authenticated user's ID
        const userRole = req.user.role; // 'buyer', 'seller', 'admin'

        console.log("Comment ID:", id); // Debugging
        console.log("User ID:", userId, "Role:", userRole); // Debugging

        // Find the comment
        const comment = await Comment.findOne({ where: { id: id } });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Buyers can only delete their own comments
        if (userRole === 'buyer' && comment.userId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        // Check if the comment belongs to a post or a livestream
        const stream = comment.streamId ? await LiveStream.findByPk(comment.streamId) : null;
        const post = comment.postId ? await Post.findByPk(comment.postId) : null;

        // Sellers can delete:
        // - Their own comments
        // - Any comment on their own stream or post
        if (userRole === 'seller') {
            if (comment.userId === userId) {
                await comment.destroy();
                return res.status(200).json({ message: 'Comment deleted successfully' });
            }
            if (stream && stream.userId === userId) {
                await comment.destroy();
                return res.status(200).json({ message: 'Comment deleted successfully from your stream' });
            }
            if (post && post.userId === userId) {
                await comment.destroy();
                return res.status(200).json({ message: 'Comment deleted successfully from your post' });
            }
            return res.status(403).json({ message: 'You cannot delete comments from another seller’s post or livestream' });
        }

        // Admins can delete any comment
        if (userRole === 'admin') {
            await comment.destroy();
            return res.status(200).json({ message: 'Comment deleted by admin' });
        }

        return res.status(403).json({ message: 'Unauthorized to delete this comment' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};