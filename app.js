import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import sequelize from './config/db.js';
import Message from './models/Message.js';
import upload from './config/multerConfig.js'; // ✅ Import Multer configuration

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import liveStreamRoutes from './routes/livestream.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import postRoutes from './routes/post.js';
import messageRoutes from './routes/messages.js';
import './models/associations.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// ✅ Improved API Route for File Uploads
app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        res.json({ fileUrl: `/uploads/${req.file.filename}` });
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/livestream', liveStreamRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static('uploads'));

// Test Route
app.get('/', (req, res) => {
    res.send('Live E-Commerce Backend is Running...');
});

// Sync Database
(async () => {
    await sequelize.sync({ alter: true });
    console.log("✅ Database Synced!");
})();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

// WebRTC PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// Store connected users (using real user IDs)
const users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User joins chat with real user ID
    socket.on('join', (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} is online with socket ID: ${socket.id}`);
    });

    // Handle sending a private message
    socket.on('sendMessage', async ({ senderId, receiverId, message, messageType, mediaUrl }) => {
        try {
            const newMessage = await Message.create({
                senderId,
                receiverId,
                message,
                messageType,
                mediaUrl
            });

            if (users[receiverId]) {
                io.to(users[receiverId]).emit('receiveMessage', newMessage);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
