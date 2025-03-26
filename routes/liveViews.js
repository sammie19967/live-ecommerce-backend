import express from 'express';
import { addView, getViews } from '../controllers/liveViewController.js';

const router = express.Router();

router.post('/', addView); // Add a new view
router.get('/:streamId', getViews); // Get total views for a stream

export default router;
