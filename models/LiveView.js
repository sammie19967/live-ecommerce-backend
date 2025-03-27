import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const LiveView = sequelize.define('LiveView', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Relationships
LiveView.belongsTo(User, { foreignKey: 'userId', onDelete: "CASCADE" });

export default LiveView;
