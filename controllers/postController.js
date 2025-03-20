import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
    try {
        const { text, imageUrl, videoUrl } = req.body;
        const userId = req.user.id;

        const post = await Post.create({ text, imageUrl, videoUrl, userId });

        // Fetch post with user details using the correct alias
        const newPost = await Post.findByPk(post.id, {
            include: { 
                model: User, 
                as: 'User',  // ✅ Match alias
                attributes: ['id', 'username']
            }
        });

        return res.status(201).json({
            message: 'Post created successfully',
            post: {
                id: newPost.id,
                text: newPost.text,
                imageUrl: newPost.imageUrl,
                videoUrl: newPost.videoUrl,
                createdAt: newPost.createdAt,
                user: {
                    id: newPost.User.id, // ✅ Ensure alias is capitalized
                    username: newPost.User.username
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};



export const getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: { 
                model: User, 
                as: 'User',  // ✅ Capital "User" (MUST match association)
                attributes: ['id', 'username'] 
            }
        });

        const formattedPosts = posts.map(post => ({
            id: post.id,
            text: post.text,
            imageUrl: post.imageUrl,
            videoUrl: post.videoUrl,
            createdAt: post.createdAt,
            user: {
                id: post.User.id, // ✅ Use correct alias (capital "User")
                username: post.User.username
            }
        }));

        return res.json(formattedPosts);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};



export const getPostById = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: { model: User, attributes: ['id', 'username'] }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });

        return res.json({
            id: post.id,
            text: post.text,
            imageUrl: post.imageUrl,
            videoUrl: post.videoUrl,
            createdAt: post.createdAt,
            user: {
                id: post.User.id,
                username: post.User.username,
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { text, imageUrl, videoUrl } = req.body;
        const post = await Post.findByPk(req.params.id, {
            include: { model: User, attributes: ['id', 'username'] }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await post.update({ text, imageUrl, videoUrl });

        return res.json({
            message: 'Post updated successfully',
            post: {
                id: post.id,
                text: post.text,
                imageUrl: post.imageUrl,
                videoUrl: post.videoUrl,
                createdAt: post.createdAt,
                user: {
                    id: post.User.id,
                    username: post.User.username,
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: { model: User, attributes: ['id', 'username'] }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await post.destroy();
        return res.json({ message: `Post by ${post.User.username} deleted successfully` });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
