import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import sequelize from './config/db.js'; // Database connection

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import liveStreamRoutes from './routes/livestream.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import postRoutes from './routes/post.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/livestream', liveStreamRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/posts', postRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Live E-Commerce Backend is Running...');
});

// Sync Database
(async () => {
    await sequelize.sync({ alter: true }); // Ensures tables match models
    console.log("✅ Database Synced!");
})();

// Create HTTP server
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// WebRTC PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// Online users map
const onlineUsers = new Map();

// WebRTC Namespace `/live`
const liveNamespace = io.of('/live');
liveNamespace.on('connection', (socket) => {
    console.log('Live user connected:', socket.id);

    socket.on('join-room', ({ roomId, userId }) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// Chat Namespace `/chat`
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
    console.log('Chat user connected:', socket.id);

    socket.on('join-chat', ({ userId }) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online`);
    });

    socket.on('send-message', ({ senderId, receiverId, message, messageType }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            chatNamespace.to(receiverSocket).emit('receive-message', { senderId, message, messageType });
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
