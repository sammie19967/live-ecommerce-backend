import { Server } from 'socket.io';
import LiveStream from '../models/LiveStream.js';
import LiveLike from '../models/LiveLike.js';
import LiveComment from '../models/LiveComment.js';
import LiveView from '../models/LiveView.js';

const activeStreams = {}; // Store active livestreams { userId: streamData }

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Send active streams list when user connects
        socket.emit('activeStreams', Object.values(activeStreams));

        // Host starts a livestream
        socket.on('startStream', async ({ userId, title }) => {
            try {
                const existingStream = await LiveStream.findOne({ where: { userId } });
                if (existingStream) {
                    return socket.emit('streamError', 'You already have an active stream.');
                }
                
                const newStream = await LiveStream.create({ userId, title, isActive: true });
                activeStreams[userId] = newStream;
                io.emit('newLiveStream', newStream); // Notify all users
                console.log(`🎥 Live stream started by ${userId}`);
            } catch (error) {
                console.error('❌ Error starting livestream:', error);
            }
        });

        // User joins a livestream
        socket.on('joinStream', ({ userId, streamId }) => {
            socket.join(streamId);
            console.log(`👤 User ${userId} joined stream ${streamId}`);
        });

        // Handle Likes in real-time
        socket.on('likeStream', async ({ userId, streamId }) => {
            try {
                const like = await LiveLike.create({ userId, streamId });
                io.to(streamId).emit('updateLiveStream', { type: 'like', userId });
                console.log(`❤️ Like added by ${userId} on stream ${streamId}`);
            } catch (error) {
                console.error('❌ Error liking stream:', error);
            }
        });

        // Handle Comments in real-time
        socket.on('commentStream', async ({ userId, streamId, comment }) => {
            try {
                const newComment = await LiveComment.create({ userId, streamId, comment });
                io.to(streamId).emit('updateLiveStream', { type: 'comment', comment: newComment });
                console.log(`💬 Comment added by ${userId} on stream ${streamId}`);
            } catch (error) {
                console.error('❌ Error adding comment:', error);
            }
        });

        // Handle Views in real-time
        socket.on('viewStream', async ({ userId, streamId }) => {
            try {
                const view = await LiveView.create({ userId, streamId });
                io.to(streamId).emit('updateLiveStream', { type: 'view', userId });
                console.log(`👀 View added by ${userId} on stream ${streamId}`);
            } catch (error) {
                console.error('❌ Error adding view:', error);
            }
        });

        // Host ends the livestream
        socket.on('endStream', async ({ userId }) => {
            try {
                await LiveStream.update({ isActive: false }, { where: { userId } });
                delete activeStreams[userId];
                io.emit('removeLiveStream', userId);
                console.log(`🛑 Live stream ended by ${userId}`);
            } catch (error) {
                console.error('❌ Error ending livestream:', error);
            }
        });

        // User disconnects
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
};
