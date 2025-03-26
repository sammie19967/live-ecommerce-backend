import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Adjust the path to your sequelize instance
import User from './User.js'; // Adjust the path to your User model
import LiveStream from './LiveStream.js'; // Adjust the path to your LiveStream model

const LiveLike = sequelize.define('LiveLike', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// Relationships
LiveLike.belongsTo(User, { foreignKey: 'userId' });
LiveLike.belongsTo(LiveStream, { foreignKey: 'streamId' });

export default LiveLike;
