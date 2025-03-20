import User from './User.js';
import Post from './Post.js';

// Ensure alias is set correctly
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'User' }); // Capital "User"
