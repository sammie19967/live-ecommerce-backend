import express from 'express';
import { createPost, getPosts, getPostById, getMyPosts, updatePost, deletePost } from '../controllers/postController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(authenticate, createPost)
    .get(getPosts);

router.route('/my-posts')
    .get(authenticate, getMyPosts);

router.route('/:postId')
    .get(getPostById)
    .put(authenticate, updatePost)
    .delete(authenticate, deletePost);

export default router;
