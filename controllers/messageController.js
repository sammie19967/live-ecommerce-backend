import Message from '../models/Message.js';
import { Op } from 'sequelize';

// ✅ Send a new message (text, image, or video)
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id; // Get logged-in user

        // ✅ Validate required fields
        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        // ✅ Determine messageType and mediaUrl based on file presence
        let messageType = 'text';
        let mediaUrl = null;

        if (req.file) {
            const fileType = req.file.mimetype.split('/')[0]; // "image" or "video"
            messageType = fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : null;

            if (!messageType) {
                return res.status(400).json({ message: 'Invalid file type' });
            }

            mediaUrl = `/uploads/${req.file.filename}`; // Store file path
        }

        // ✅ Ensure either message text or media is provided
        if (!message && !mediaUrl) {
            return res.status(400).json({ message: 'Message text or media file is required' });
        }

        // ✅ Create and store the message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || null,
            messageType,
            mediaUrl
        });

        console.log('Message saved:', newMessage);

        return res.status(201).json({ message: 'Message sent', data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Get messages between two users
export const getMessages = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        return res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Delete a message (only sender can delete)
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // Get logged-in user

        if (!messageId) {
            return res.status(400).json({ message: 'Message ID is required' });
        }

        // ✅ Find the message
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // ✅ Only the sender can delete their message
        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this message' });
        }

        // ✅ Delete the message
        await message.destroy();

        return res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
