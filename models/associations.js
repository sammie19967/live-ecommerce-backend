import User from './User.js';
import LiveStream from './LiveStream.js';
import LiveView from './LiveView.js';
import Post from './Post.js'; // Import the Post model

// Define Relationships
User.hasMany(LiveStream, { foreignKey: 'sellerId', onDelete: 'CASCADE' });
LiveStream.belongsTo(User, { foreignKey: 'sellerId' });

LiveStream.hasMany(LiveView, { foreignKey: 'streamId', onDelete: 'CASCADE' });
LiveView.belongsTo(LiveStream, { foreignKey: 'streamId' });

User.hasMany(LiveView, { foreignKey: 'userId', onDelete: 'CASCADE' });
LiveView.belongsTo(User, { foreignKey: 'userId' });

// Association between User and Post
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' }); // A User can have many Posts
Post.belongsTo(User, { foreignKey: 'userId' }); // A Post belongs to a User

export { User, LiveStream, LiveView, Post };
