import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
    try {
        const { text, imageUrl, videoUrl } = req.body;
        const userId = req.user.id; // Assuming authentication

        const post = await Post.create({ text, imageUrl, videoUrl, userId });

        return res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: { model: User, attributes: ['id', 'username'] }
        });
        return res.json(posts);
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

        return res.json(post);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { text, imageUrl, videoUrl } = req.body;
        const post = await Post.findByPk(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await post.update({ text, imageUrl, videoUrl });
        return res.json({ message: 'Post updated successfully', post });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await post.destroy();
        return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
