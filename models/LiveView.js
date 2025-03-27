import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import LiveStream from './LiveStream.js';

const LiveView = sequelize.define('LiveView', {
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

LiveView.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
LiveView.belongsTo(LiveStream, { foreignKey: 'streamId', onDelete: 'CASCADE' });

export default LiveView;
