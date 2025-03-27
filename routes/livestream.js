import express from 'express';
import * as LiveStreamController from '../controllers/liveStreamController.js';

const router = express.Router();

// LiveStream Routes
router.post('/livestreams', LiveStreamController.createLiveStream);
router.get('/livestreams', LiveStreamController.getLiveStreams);
router.put('/livestreams/:streamId', LiveStreamController.endLiveStream);

// LiveLike Routes
router.post('/livestreams/:streamId/like', LiveStreamController.likeStream);

// LiveComment Routes
router.post('/livestreams/:streamId/comment', LiveStreamController.commentOnStream);

// LiveView Routes
router.post('/livestreams/:streamId/view', LiveStreamController.addLiveView);

export default router;
