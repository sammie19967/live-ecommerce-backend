import express from 'express';
import { authenticate, isSeller } from '../middleware/authMiddleware.js';
import LiveStream from '../models/LiveStream.js';

const router = express.Router();
// Add this to your backend (livestreamRoutes.js)
router.get('/', async (req, res) => {
    try {
        const liveStreams = await LiveStream.findAll({ where: { isActive: true } });
        res.json(liveStreams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// @route   POST /api/livestream/start
// @desc    Sellers can start a live stream
// @access  Private (Only Sellers)
router.post('/start', authenticate, isSeller, async (req, res) => {
    try {
        const { title } = req.body;

        const liveStream = await LiveStream.create({
            title,
            streamKey: Math.random().toString(36).substring(2, 15), // Generate a unique stream key
            sellerId: req.user.id
        });

        res.json({ message: 'Live stream started', liveStream });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/livestream/end/:id
// @desc    Sellers can end a live stream
// @access  Private (Only Sellers)
router.post('/end/:id', authenticate, isSeller, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the live stream by ID
        const liveStream = await LiveStream.findOne({ where: { id, sellerId: req.user.id } });

        if (!liveStream) {
            return res.status(404).json({ message: 'Live stream not found' });
        }

        // Update the isActive field to false
        liveStream.isActive = false;
        await liveStream.save();

        res.json({ message: 'Live stream ended', liveStream });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
