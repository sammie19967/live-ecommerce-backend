import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const LiveStream = sequelize.define('LiveStream', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    streamKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Relationship: A User can have only ONE LiveStream
LiveStream.belongsTo(User, { foreignKey: 'userId', unique: true, onDelete: "CASCADE" });

export default LiveStream;
