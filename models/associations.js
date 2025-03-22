import User from "./User.js";
import Post from "./Post.js";

// ✅ Define Relationships
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

export { User, Post }; // Exporting so we can use them in other files
