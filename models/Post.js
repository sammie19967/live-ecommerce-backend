import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING, // Stores image URL (uploaded to a server or cloud)
        allowNull: true
    },
    videoUrl: {
        type: DataTypes.STRING, // Stores video URL
        allowNull: true
    }
}, {
    timestamps: true
});

export default Post;
