// socketHandlers/messageSocket.js
import Message from '../models/Message.js';

const users = {}; // Stores online users { userId: socketId }

export const handleMessaging = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 A user connected:', socket.id);

        // ✅ User joins chat
        socket.on('join', (userId) => {
            if (users[userId]) {
                delete users[userId]; // Remove old session if exists
            }
            users[userId] = socket.id;
            console.log(`✅ User ${userId} joined with socket ID: ${socket.id}`);
        });

        // ✅ Handle sending a private message
        socket.on('sendMessage', async ({ senderId, receiverId, message, messageType, mediaUrl }) => {
            try {
                // Store message in database
                const newMessage = await Message.create({
                    senderId,
                    receiverId,
                    message,
                    messageType,
                    mediaUrl
                });

                // Emit message to sender
                if (users[senderId]) {
                    io.to(users[senderId]).emit('messageSent', newMessage);
                }

                // Emit message to receiver (if online)
                if (users[receiverId]) {
                    io.to(users[receiverId]).emit('receiveMessage', newMessage);
                } else {
                    console.log(`ℹ️ User ${receiverId} is offline. Message stored.`);
                }

            } catch (error) {
                console.error("❌ Error sending message:", error);
            }
        });

        // ✅ Handle user disconnect
        socket.on('disconnect', () => {
            console.log('❌ A user disconnected:', socket.id);
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    console.log(`User ${userId} disconnected.`);
                    delete users[userId];
                    break;
                }
            }
        });
    });
};
