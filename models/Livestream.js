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

// Relationship: A LiveStream belongs to a User (Seller)
LiveStream.belongsTo(User, { foreignKey: 'sellerId' });

export default LiveStream;
