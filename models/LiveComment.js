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
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Relationships
LiveComment.belongsTo(User, { foreignKey: 'userId' });
LiveComment.belongsTo(LiveStream, { foreignKey: 'streamId' });

export default LiveComment;
