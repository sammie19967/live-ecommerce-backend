import { ExpressPeerServer } from 'peer';

export function setupWebRTC(io, server) {
    const peerServer = ExpressPeerServer(server, { debug: true });

    io.on('connection', (socket) => {
        console.log('🔌 WebRTC user connected:', socket.id);

        socket.on('startStream', (hostId) => {
            socket.join(hostId);
            io.to(hostId).emit('streamStarted', { hostId });
            console.log(`🎥 Stream started by ${hostId}`);
        });

        socket.on('joinStream', (hostId) => {
            socket.join(hostId);
            io.to(hostId).emit('userJoined', { userId: socket.id });
            console.log(`👤 User joined stream ${hostId}`);
        });

        socket.on('sendComment', ({ hostId, userId, comment }) => {
            io.to(hostId).emit('receiveComment', { userId, comment });
        });

        socket.on('sendLike', ({ hostId, userId }) => {
            io.to(hostId).emit('receiveLike', { userId });
        });

        socket.on('leaveStream', (hostId) => {
            socket.leave(hostId);
            io.to(hostId).emit('userLeft', { userId: socket.id });
        });

        socket.on('endStream', (hostId) => {
            io.to(hostId).emit('streamEnded');
            io.socketsLeave(hostId);
            console.log(`🚫 Stream ended: ${hostId}`);
        });

        socket.on('disconnect', () => {
            console.log('❌ WebRTC user disconnected:', socket.id);
        });
    });

    return peerServer;
}
