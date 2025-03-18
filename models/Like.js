import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Comment = sequelize.define('Comment', {
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER, // For posts (optional)
        allowNull: true,
    },
    streamId: {
        type: DataTypes.INTEGER, // For live streams (optional)
        allowNull: true,
    }
});

const Like = sequelize.define('Like', {
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID, // Change this to UUID to match the User model
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER, // For posts (optional)
        allowNull: true,
    },
    streamId: {
        type: DataTypes.INTEGER, // For live streams (optional)
        allowNull: true,
    }
});

export default Like;
