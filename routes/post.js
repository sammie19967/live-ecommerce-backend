import express from "express";
import { 
    createPost, 
    getPosts, 
    getPostById, 
    getMyPosts, 
    updatePost, 
    deletePost 
} from "../controllers/postController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../config/multerConfig.js"; // Import Multer for file handling

const router = express.Router();

router.route("/")
    .post(authenticate, upload.array("files", 5), createPost) // Apply Multer before createPost
    .get(getPosts);

router.route("/my-posts")
    .get(authenticate, getMyPosts);

router.route("/:postId")
    .get(getPostById)
    .put(authenticate, updatePost)
    .delete(authenticate, deletePost);

export default router;
