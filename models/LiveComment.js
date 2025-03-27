import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const LiveComment = sequelize.define('LiveComment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Relationships
LiveComment.belongsTo(User, { foreignKey: 'userId', onDelete: "CASCADE" });

export default LiveComment;
