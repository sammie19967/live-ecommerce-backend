import LiveStream from "../models/LiveStream.js";
import LiveLike from "../models/LiveLike.js";
import LiveComment from "../models/LiveComment.js";
import LiveView from "../models/LiveView.js";

// Create a live stream
export const createLiveStream = async (req, res) => {
    try {
        const { userId, title, description } = req.body;
        const stream = await LiveStream.create({ userId, title, description, isActive: true });
        res.status(201).json(stream);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get active live streams
export const getLiveStreams = async (req, res) => {
    try {
        const streams = await LiveStream.findAll({ where: { isActive: true } });
        res.status(200).json(streams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End a live stream
export const endLiveStream = async (req, res) => {
    try {
        const { streamId } = req.params;
        await LiveStream.update({ isActive: false }, { where: { id: streamId } });
        res.status(200).json({ message: "Stream ended successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a like to a stream
export const likeStream = async (req, res) => {
    try {
        const { userId } = req.body;
        const { streamId } = req.params;
        await LiveLike.findOrCreate({ where: { userId, streamId } });
        res.status(200).json({ message: "Stream liked successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a comment to a stream
export const commentOnStream = async (req, res) => {
    try {
        const { userId, comment } = req.body;
        const { streamId } = req.params;
        const newComment = await LiveComment.create({ userId, streamId, comment });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a viewer to a stream
export const addLiveView = async (req, res) => {
    try {
        const { userId } = req.body;
        const { streamId } = req.params;
        await LiveView.findOrCreate({ where: { userId, streamId } });
        res.status(200).json({ message: "View recorded successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
