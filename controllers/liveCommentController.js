import LiveComment from '../models/LiveComment.js';
import LiveStream from '../models/LiveStream.js';
import User from '../models/User.js';

// Add a comment
export const addComment = async (req, res) => {
    try {
        const { userId, streamId, comment } = req.body;

        const stream = await LiveStream.findByPk(streamId);
        if (!stream) {
            return res.status(404).json({ message: "Stream not found" });
        }

        const newComment = await LiveComment.create({ userId, streamId, comment });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all comments for a stream
export const getComments = async (req, res) => {
    try {
        const { streamId } = req.params;

        const comments = await LiveComment.findAll({
            where: { streamId },
            include: [{ model: User, attributes: ['id', 'username'] }],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
