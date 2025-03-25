import { Server as SocketIOServer } from 'socket.io';
import { ExpressPeerServer } from 'peer';

const liveStreams = {}; // Store active streams { streamId: { host, viewers } }

export function setupWebRTC(server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://192.168.100.4:5173'],
            credentials: true
        }
    });

    const peerServer = ExpressPeerServer(server, { debug: true });
    
    io.on('connection', (socket) => {
        console.log('🔌 A user connected:', socket.id);

        socket.on('startStream', ({ streamId, hostId }) => {
            if (!liveStreams[streamId]) {
                liveStreams[streamId] = { host: hostId, viewers: [] };
                console.log(`🎥 Live stream started by ${hostId} (ID: ${streamId})`);
                io.emit('streamStarted', { streamId, hostId });
            }
        });

        socket.on('joinStream', ({ streamId, userId }) => {
            if (liveStreams[streamId]) {
                liveStreams[streamId].viewers.push(userId);
                console.log(`👀 ${userId} joined stream ${streamId}`);
                io.emit('viewerJoined', { streamId, userId });
            }
        });

        socket.on('sendComment', ({ streamId, userId, comment }) => {
            console.log(`💬 ${userId} commented on stream ${streamId}: ${comment}`);
            io.emit('newComment', { streamId, userId, comment });
        });

        socket.on('sendLike', ({ streamId, userId }) => {
            console.log(`❤️ ${userId} liked stream ${streamId}`);
            io.emit('newLike', { streamId, userId });
        });

        socket.on('leaveStream', ({ streamId, userId }) => {
            if (liveStreams[streamId]) {
                liveStreams[streamId].viewers = liveStreams[streamId].viewers.filter(v => v !== userId);
                console.log(`🚪 ${userId} left stream ${streamId}`);
                io.emit('viewerLeft', { streamId, userId });
            }
        });

        socket.on('endStream', ({ streamId }) => {
            if (liveStreams[streamId]) {
                console.log(`🛑 Stream ${streamId} ended`);
                delete liveStreams[streamId];
                io.emit('streamEnded', { streamId });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ A user disconnected:', socket.id);
        });
    });

    return { io, peerServer };
}
