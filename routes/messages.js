import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send a message (text, image, or video)
router.post('/', authenticate, sendMessage);

// Get messages between two users
router.get('/:receiverId', authenticate, getMessages);

export default router;
