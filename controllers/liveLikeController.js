import LiveLike from '../models/LiveLike.js';
import LiveStream from '../models/LiveStream.js';

export const likeStream = async (req, res) => {
    try {
        const { userId, streamId } = req.body;

        const stream = await LiveStream.findByPk(streamId);
        if (!stream) {
            return res.status(404).json({ message: "Stream not found" });
        }

        // Check if user already liked the stream
        const existingLike = await LiveLike.findOne({ where: { userId, streamId } });

        if (existingLike) {
            return res.status(400).json({ message: "You already liked this stream" });
        }

        const newLike = await LiveLike.create({ userId, streamId });

        res.status(201).json(newLike);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get total likes for a stream
export const getLikes = async (req, res) => {
    try {
        const { streamId } = req.params;

        const likesCount = await LiveLike.count({ where: { streamId } });

        res.status(200).json({ likes: likesCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
