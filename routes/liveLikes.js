import express from 'express';
import { likeStream, getLikes } from '../controllers/liveLikeController.js';

const router = express.Router();

router.post('/', likeStream); // Like a stream
router.get('/:streamId', getLikes); // Get total likes for a stream

export default router;
