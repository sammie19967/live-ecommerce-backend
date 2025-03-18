import Comment from '../models/Comment.js';
import LiveStream from '../models/Livestream.js';
import User from '../models/User.js';

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
        const userId = req.user.id; // Assuming user authentication middleware
        const isAdmin = req.user.role === 'admin'; // Assuming user role check

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await comment.destroy();
        return res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
