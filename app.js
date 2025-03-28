import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import sequelize from './config/db.js';
import { setupWebRTC } from './socket/webrtc.js'; // ✅ Ensure this correctly initializes WebRTC

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import liveStreamRoutes from './routes/livestream.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import postRoutes from './routes/post.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';
import followerRoutes from './routes/follower.js';
import ratingsRoutes from './routes/ratings.js';



import { handleMessaging } from './socket/messageSocket.js'; // ✅ Messaging logic

import './models/associations.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.100.4:5173'],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Upload route
app.use('/api', uploadRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/livestream', liveStreamRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/uploads', express.static('uploads'));


// Test Route
app.get('/', (req, res) => {
    res.send('Live E-Commerce Backend is Running...');
});

// Sync Database
(async () => {
    await sequelize.sync({ force: true });
    console.log("✅ Database Synced!");
})();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO (General setup)
const io = new SocketIOServer(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://192.168.100.4:5173'],
        credentials: true
    },
    transports: ['websocket', 'polling'] // ✅ Fix potential WebSocket issue
});

// ✅ Handle messaging separately
handleMessaging(io);

// ✅ Setup WebRTC (for live streaming, ensures users get permissions)
setupWebRTC(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
