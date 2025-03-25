import { Server } from 'socket.io';

const liveStreams = {}; // Stores active streams { hostId: { viewers, likes, comments } }

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 A user connected:', socket.id);

        // ✅ Host starts a live stream
        socket.on('startStream', (hostId) => {
            liveStreams[hostId] = { viewers: [], likes: 0, comments: [] };
            socket.join(hostId);
            console.log(`🎥 Host ${hostId} started a stream`);
        });

        // ✅ Viewer joins a stream
        socket.on('joinStream', ({ hostId, userId }) => {
            if (liveStreams[hostId]) {
                liveStreams[hostId].viewers.push(userId);
                socket.join(hostId);
                io.to(hostId).emit('viewerJoined', { userId, viewers: liveStreams[hostId].viewers.length });
                console.log(`👀 Viewer ${userId} joined stream of ${hostId}`);
            }
        });

        // ✅ Send live comment
        socket.on('sendComment', ({ hostId, userId, comment }) => {
            if (liveStreams[hostId]) {
                const newComment = { userId, comment, timestamp: new Date() };
                liveStreams[hostId].comments.push(newComment);
                io.to(hostId).emit('receiveComment', newComment);
                console.log(`💬 Comment from ${userId} on ${hostId}'s stream: ${comment}`);
            }
        });

        // ✅ Send like to stream
        socket.on('sendLike', ({ hostId, userId }) => {
            if (liveStreams[hostId]) {
                liveStreams[hostId].likes += 1;
                io.to(hostId).emit('updateLikes', liveStreams[hostId].likes);
                console.log(`❤️ Like from ${userId} on ${hostId}'s stream`);
            }
        });

        // ✅ Host ends the stream
        socket.on('endStream', (hostId) => {
            if (liveStreams[hostId]) {
                io.to(hostId).emit('streamEnded');
                delete liveStreams[hostId];
                console.log(`⏹️ Host ${hostId} ended the stream`);
            }
        });

        // ✅ Handle disconnect
        socket.on('disconnect', () => {
            console.log('❌ A user disconnected:', socket.id);
        });
    });
};
