import LiveView from '../models/LiveView.js';
import LiveStream from '../models/LiveStream.js';

export const addView = async (req, res) => {
    try {
        const { userId, streamId } = req.body;

        const stream = await LiveStream.findByPk(streamId);
        if (!stream) {
            return res.status(404).json({ message: "Stream not found" });
        }

        // Prevent duplicate views from the same user
        const existingView = await LiveView.findOne({ where: { userId, streamId } });

        if (!existingView) {
            await LiveView.create({ userId, streamId });
        }

        const viewsCount = await LiveView.count({ where: { streamId } });

        res.status(201).json({ views: viewsCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get total views for a stream
export const getViews = async (req, res) => {
    try {
        const { streamId } = req.params;

        const viewsCount = await LiveView.count({ where: { streamId } });

        res.status(200).json({ views: viewsCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
