import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Follower = sequelize.define("Follower", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// ✅ A user can follow multiple users, and a user can be followed by multiple users
User.belongsToMany(User, {
    through: Follower,
    as: "Followers",
    foreignKey: "followingId", // The user being followed
    otherKey: "followerId", // The user who follows
    onDelete: "CASCADE"
});

export default Follower;
