// Updated webrtc.js with more robust features
const liveStreams = new Map(); // Better performance than plain object

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Track user's current stream
        let currentStream = null;

        // Host starts a live stream
        socket.on('startStream', ({ hostId, streamId }) => {
            liveStreams.set(streamId, {
                hostId,
                viewers: new Set(), // Using Set prevents duplicates
                likes: 0,
                likeUsers: new Set(), // Track who liked to prevent duplicates
                comments: [],
                startTime: new Date(),
                status: 'live'
            });
            
            socket.join(streamId);
            currentStream = streamId;
            io.emit('streamListUpdated', Array.from(liveStreams.keys()));
            console.log(`🎥 Host ${hostId} started stream ${streamId}`);
        });

        // Viewer joins a stream
        socket.on('joinStream', ({ streamId, userId }) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                stream.viewers.add(userId);
                socket.join(streamId);
                currentStream = streamId;
                
                // Update all clients in the stream
                io.to(streamId).emit('streamUpdate', {
                    viewers: stream.viewers.size,
                    likes: stream.likes,
                    comments: stream.comments.slice(-50) // Send last 50 comments
                });
                
                console.log(`👀 Viewer ${userId} joined stream ${streamId}`);
            }
        });

        // Send live comment with rate limiting
        socket.on('sendComment', ({ streamId, userId, comment }) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                // Basic rate limiting (1 comment per second)
                const lastComment = stream.comments[stream.comments.length - 1];
                if (lastComment && lastComment.userId === userId && 
                    (new Date() - lastComment.timestamp) < 1000) {
                    return socket.emit('commentError', 'You\'re commenting too fast!');
                }

                const newComment = {
                    userId,
                    comment,
                    timestamp: new Date()
                };
                
                stream.comments.push(newComment);
                io.to(streamId).emit('receiveComment', newComment);
            }
        });

        // Send like with duplicate prevention
        socket.on('sendLike', ({ streamId, userId }) => {
            const stream = liveStreams.get(streamId);
            if (stream && !stream.likeUsers.has(userId)) {
                stream.likes += 1;
                stream.likeUsers.add(userId);
                io.to(streamId).emit('updateLikes', stream.likes);
            }
        });

        // Get stream info
        socket.on('getStreamInfo', ({ streamId }, callback) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                callback({
                    viewers: stream.viewers.size,
                    likes: stream.likes,
                    comments: stream.comments.slice(-50),
                    duration: Math.floor((new Date() - stream.startTime) / 1000)
                });
            }
        });

        // Host ends the stream
        socket.on('endStream', ({ streamId }) => {
            if (liveStreams.has(streamId)) {
                io.to(streamId).emit('streamEnded');
                liveStreams.delete(streamId);
                io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                console.log(`⏹️ Stream ${streamId} ended`);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (currentStream) {
                const stream = liveStreams.get(currentStream);
                if (stream) {
                    // If host disconnects, end the stream
                    if (stream.hostId === socket.id) {
                        io.to(currentStream).emit('streamEnded');
                        liveStreams.delete(currentStream);
                        io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                        console.log(`⏹️ Stream ${currentStream} ended due to host disconnect`);
                    }
                    // Remove viewer
                    else if (stream.viewers.has(socket.id)) {
                        stream.viewers.delete(socket.id);
                        io.to(currentStream).emit('viewerLeft', {
                            viewers: stream.viewers.size
                        });
                    }
                }
            }
            console.log('❌ User disconnected:', socket.id);
        });
    });
};