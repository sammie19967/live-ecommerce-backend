import Message from '../models/Message.js';
import { Op } from 'sequelize';

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message, messageType, mediaUrl } = req.body;
        const senderId = req.user.id; // Get user from token

        if (!receiverId || !messageType) {
            return res.status(400).json({ message: 'Receiver and message type are required' });
        }

        // Create message
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

// Get messages between two users
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
