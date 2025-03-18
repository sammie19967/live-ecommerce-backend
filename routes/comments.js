import express from 'express';
import { addComment, getComments, getCommentById, updateComment, deleteComment } from '../controllers/commentController.js';
import {authenticate} from '../middleware/authMiddleware.js'; // Ensure user authentication

const router = express.Router();

router.post('/', authenticate, addComment); // Add a comment
router.get('/', getComments); // Get all comments (optional filtering by stream)
router.get('/:id', getCommentById); // Get a specific comment
router.put('/:id', authenticate, updateComment); // Update a comment (owner only)
router.delete('/:id', authenticate, deleteComment); // Delete a comment (owner/admin)

export default router;

