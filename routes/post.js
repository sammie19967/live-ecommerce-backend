import express from 'express';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../controllers/postController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(authenticate, createPost)
    .get(getPosts);

router.route('/:id')
    .get(getPostById)
    .put(authenticate, updatePost)
    .delete(authenticate, deletePost);

export default router;
