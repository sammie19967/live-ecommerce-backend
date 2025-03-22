import Rating from "../models/Ratings.js";
import Post from "../models/Post.js";

/**
 * @desc    Rate a post (Create or Update Rating)
 * @route   POST /api/ratings/:postId
 * @access  Private (Authenticated users only)
 */
export const ratePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        // Validate rating input (1-5)
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        // Ensure post exists
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Check if user has already rated the post
        let userRating = await Rating.findOne({ where: { userId, postId } });

        if (userRating) {
            // Update existing rating
            userRating.rating = rating;
            await userRating.save();
        } else {
            // Create new rating
            userRating = await Rating.create({ userId, postId, rating });
        }

        res.status(200).json({ message: "Rating submitted successfully.", rating: userRating });
    } catch (error) {
        console.error("❌ Rating Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get average rating of a post
 * @route   GET /api/ratings/:postId
 * @access  Public
 */
export const getPostRating = async (req, res) => {
    try {
        const { postId } = req.params;

        // Fetch average rating
        const result = await Rating.findOne({
            attributes: [[Rating.sequelize.fn("AVG", Rating.sequelize.col("rating")), "averageRating"]],
            where: { postId }
        });

        res.status(200).json({ postId, averageRating: result?.dataValues.averageRating || 0 });
    } catch (error) {
        console.error("❌ Fetch Rating Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
