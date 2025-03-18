import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


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
        type: DataTypes.UUID, // For posts (optional)
        allowNull: true,
    },
    streamId: {
        type: DataTypes.UUID, // For live streams (optional)
        allowNull: true,
    }
});

export default Like;
