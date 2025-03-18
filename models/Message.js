import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true // Nullable for media messages
    },
    messageType: {
        type: DataTypes.ENUM('text', 'image', 'video'),
        allowNull: false
    },
    mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true // Only needed for image/video messages
    }
}, {
    timestamps: true
});

// Define relationships
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

export default Message;
