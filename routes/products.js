import express from 'express';
import { authenticate, isSeller } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';

const router = express.Router();

// @route   POST /api/products
// @desc    Sellers can add new products
// @access  Private (Only Sellers)
router.post('/', authenticate, isSeller, async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price,
            imageUrl,
            sellerId: req.user.id
        });

        res.json({ message: 'Product added successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
