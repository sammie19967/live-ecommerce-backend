import User from './User.js';
import LiveStream from './LiveStream.js';
import LiveView from './LiveView.js';

// Define Relationships
User.hasMany(LiveStream, { foreignKey: 'sellerId', onDelete: 'CASCADE' });
LiveStream.belongsTo(User, { foreignKey: 'sellerId' });

LiveStream.hasMany(LiveView, { foreignKey: 'streamId', onDelete: 'CASCADE' });
LiveView.belongsTo(LiveStream, { foreignKey: 'streamId' });

User.hasMany(LiveView, { foreignKey: 'userId', onDelete: 'CASCADE' });
LiveView.belongsTo(User, { foreignKey: 'userId' });

export { User, LiveStream, LiveView };
