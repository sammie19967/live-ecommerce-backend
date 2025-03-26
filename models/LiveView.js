import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Import the sequelize instance
import User from './User.js'; // Ensure the path and extension are correct
import LiveStream from './LiveStream.js'; // Ensure the path and extension are correct

const LiveView = sequelize.define('LiveView', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

// Relationships
LiveView.belongsTo(User, { foreignKey: 'userId' });
LiveView.belongsTo(LiveStream, { foreignKey: 'streamId' });

export default LiveView;
