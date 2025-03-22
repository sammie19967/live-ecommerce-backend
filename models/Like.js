import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Post from "./Post.js";

const Like = sequelize.define("Like", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// ✅ A user can like multiple posts, and a post can have multiple likes
User.hasMany(Like, { foreignKey: "userId", onDelete: "CASCADE" });
Like.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Like, { foreignKey: "postId", onDelete: "CASCADE" });
Like.belongsTo(Post, { foreignKey: "postId" });

export default Like;
