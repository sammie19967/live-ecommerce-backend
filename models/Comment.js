import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import LiveStream from './LiveStream.js';
import Post from './Post.js';

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.UUID, // Use UUID instead of INTEGER
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
        primaryKey: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID, // Use UUID for userId
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    postId: {
        type: DataTypes.UUID, // Use UUID for postId
        allowNull: true,
        references: {
            model: Post,
            key: 'id'
        }
    },
    streamId: {
        type: DataTypes.UUID, // Use UUID for streamId
        allowNull: true,
        references: {
            model: LiveStream,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Comments',
    timestamps: true,
});

Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(LiveStream, { foreignKey: 'streamId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });

export default Comment;
