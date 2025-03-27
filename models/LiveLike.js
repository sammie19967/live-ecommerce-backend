import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const LiveLike = sequelize.define('LiveLike', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// Relationships
LiveLike.belongsTo(User, { foreignKey: 'userId', onDelete: "CASCADE" });

export default LiveLike;
