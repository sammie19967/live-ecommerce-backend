import { Server } from 'socket.io';
import LiveStream from '../models/LiveStream.js';
import LiveLike from '../models/LiveLike.js';
import LiveComment from '../models/LiveComment.js';
import LiveView from '../models/LiveView.js';

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Fetch and emit the list of active streams when a user connects
        const emitActiveStreams = async () => {
            try {
                const activeStreams = await LiveStream.findAll({ where: { isActive: true } });
                io.emit('activeStreams', activeStreams); // Emit to all connected clients
            } catch (error) {
                console.error('Error fetching active streams:', error);
            }
        };

        // Emit the current list of active streams to the newly connected client
        emitActiveStreams();

        // Host starts a livestream
        socket.on('startStream', async ({ userId, title }) => {
            try {
                // Check if the user already has an active stream
                const existingStream = await LiveStream.findOne({ where: { userId, isActive: true } });
                if (existingStream) {
                    socket.emit('error', 'You already have an active stream.');
                    return;
                }

                // Create a new live stream in the database
                const newStream = await LiveStream.create({ userId, title });
                console.log(`🎥 New live stream started by user ${userId}: ${title}`);

                // Emit the updated list of active streams
                emitActiveStreams();
            } catch (error) {
                console.error('Error starting live stream:', error);
                socket.emit('error', 'Failed to start live stream.');
            }
        });

        // User joins a livestream
        socket.on('joinStream', async ({ userId, streamId }) => {
            try {
                const stream = await LiveStream.findByPk(streamId);
                if (!stream || !stream.isActive) {
                    socket.emit('error', 'Stream not found or inactive.');
                    return;
                }

                socket.join(streamId); // Join the stream's room
                console.log(`👤 User ${userId} joined stream ${streamId}`);

                // Add a view to the stream
                await LiveView.create({ userId, streamId });

                // Emit updated view count to all clients in the stream
                const viewCount = await LiveView.count({ where: { streamId } });
                io.to(streamId).emit('updateLiveStream', { type: 'view', streamId, viewCount });
            } catch (error) {
                console.error('Error joining stream:', error);
                socket.emit('error', 'Failed to join stream.');
            }
        });

        // User leaves a livestream
        socket.on('leaveStream', async ({ userId, streamId }) => {
            socket.leave(streamId);
            console.log(`👤 User ${userId} left stream ${streamId}`);

            // Emit updated view count to all clients in the stream
            const viewCount = await LiveView.count({ where: { streamId } });
            io.to(streamId).emit('updateLiveStream', { type: 'view', streamId, viewCount });
        });

        // Handle Likes in real-time
        socket.on('likeStream', async ({ userId, streamId }) => {
            try {
                await LiveLike.create({ userId, streamId });

                // Emit updated like count to all clients in the stream
                const likeCount = await LiveLike.count({ where: { streamId } });
                io.to(streamId).emit('updateLiveStream', { type: 'like', streamId, likeCount });
                console.log(`❤️ Like added by ${userId} on stream ${streamId}`);
            } catch (error) {
                console.error('❌ Error liking stream:', error);
                socket.emit('error', 'Failed to like stream.');
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
                socket.emit('error', 'Failed to add comment.');
            }
        });

        // Host ends a livestream
        socket.on('endStream', async ({ userId }) => {
            try {
                // Mark the live stream as inactive in the database
                const result = await LiveStream.update(
                    { isActive: false },
                    { where: { userId, isActive: true } }
                );

                if (result[0] === 0) {
                    socket.emit('error', 'No active stream found to end.');
                    return;
                }

                console.log(`🛑 Live stream ended by user ${userId}`);

                // Emit the updated list of active streams
                emitActiveStreams();
            } catch (error) {
                console.error('Error ending live stream:', error);
                socket.emit('error', 'Failed to end live stream.');
            }
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};
