import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import LiveStream from './LiveStream.js';

const LiveLike = sequelize.define('LiveLike', {
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
    }
});

LiveLike.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
LiveLike.belongsTo(LiveStream, { foreignKey: 'streamId', onDelete: 'CASCADE' });

export default LiveLike;
