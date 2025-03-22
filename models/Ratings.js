import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Post from "./Post.js";

const Rating = sequelize.define("Rating", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
});

// ✅ A user can rate multiple posts, and a post can have multiple ratings
User.hasMany(Rating, { foreignKey: "userId", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Rating, { foreignKey: "postId", onDelete: "CASCADE" });
Rating.belongsTo(Post, { foreignKey: "postId" });

export default Rating;
