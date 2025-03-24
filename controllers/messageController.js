import Message from '../models/Message.js';
import { Op } from 'sequelize';

// ✅ Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message, messageType, mediaUrl } = req.body;
        const senderId = req.user.id; // Get logged-in user

        if (!receiverId || !messageType) {
            return res.status(400).json({ message: 'Receiver and message type are required' });
        }

        // ✅ Create and store the message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            messageType,
            mediaUrl
        });

        return res.status(201).json({ message: 'Message sent', data: newMessage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Get messages between two users
export const getMessages = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

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
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Delete a message (only sender can delete)
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // Get logged-in user

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
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
