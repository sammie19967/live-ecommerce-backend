import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import Like from '../models/Like.js';

const router = express.Router();

// Like a post or live stream
router.post('/', authenticate, async (req, res) => {
    const { postId, streamId } = req.body;

    if (!postId && !streamId) {
        return res.status(400).json({ message: 'Post ID or Stream ID is required' });
    }

    try {
        // Check if already liked
        const existingLike = await Like.findOne({
            where: {
                userId: req.user.id,
                ...(postId ? { postId } : { streamId })
            }
        });

        if (existingLike) {
            return res.status(400).json({ message: 'Already liked' });
        }

        const like = await Like.create({
            userId: req.user.id,
            postId: postId || null,
            streamId: streamId || null
        });

        res.json({ message: 'Liked successfully', like });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get like count for a post or live stream
router.get('/count', async (req, res) => {
    const { postId, streamId } = req.query;

    try {
        const likeCount = await Like.count({
            where: {
                ...(postId ? { postId } : { streamId })
            }
        });

        res.json({ likeCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
