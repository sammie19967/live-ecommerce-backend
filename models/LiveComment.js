import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import LiveStream from './LiveStream.js';

const LiveComment = sequelize.define('LiveComment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    streamId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

LiveComment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
LiveComment.belongsTo(LiveStream, { foreignKey: 'streamId', onDelete: 'CASCADE' });

export default LiveComment;
