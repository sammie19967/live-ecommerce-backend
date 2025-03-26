import express from 'express';
import { addComment, getComments } from '../controllers/liveCommentController.js';

const router = express.Router();

router.post('/', addComment); // Add a new comment
router.get('/:streamId', getComments); // Get comments for a specific stream

export default router;
