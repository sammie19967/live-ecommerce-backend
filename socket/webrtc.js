import LiveStream from '../models/LiveStream.js';
import LiveComment from '../models/LiveComment.js';
import LiveLike from '../models/LiveLike.js';
import LiveView from '../models/LiveView.js';

const liveStreams = new Map();

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);
        let currentUserId = null;

        socket.on('startStream', async ({ userId }) => {
            console.log('📡 startStream event received:', { userId });
            if (!userId) {
                console.error('❌ userId is missing in startStream');
                return socket.emit('error', 'userId is required');
            }
            
            await LiveStream.upsert({ id: userId, isActive: true });
            liveStreams.set(userId, {
                hostId: userId,
                viewers: new Map(),
                likes: 0,
                likeUsers: new Set(),
                comments: [],
                startTime: new Date(),
                status: 'live'
            });
            socket.join(userId);
            currentUserId = userId;
            io.emit('streamListUpdated', Array.from(liveStreams.keys()));
            console.log(`🎥 Host ${userId} started streaming`);
        });

        socket.on('joinStream', async ({ userId }) => {
            if (!userId) return socket.emit('error', 'userId is required');
            
            const stream = liveStreams.get(userId);
            if (!stream) {
                console.warn(`⚠️ Stream for ${userId} is not active`);
                return socket.emit('error', 'Stream is not active');
            }
            
            if (!stream.viewers.has(socket.id)) {
                stream.viewers.set(socket.id, userId);
                await LiveView.findOrCreate({ where: { userId } });
            }
            
            socket.join(userId);
            io.to(userId).emit('streamUpdate', {
                viewers: stream.viewers.size,
                likes: stream.likes,
                comments: stream.comments.slice(-50)
            });
            console.log(`👀 Viewer joined stream of ${userId}`);
        });

        socket.on('sendComment', async ({ userId, comment }) => {
            if (!userId) return socket.emit('error', 'userId is required');
            
            const stream = liveStreams.get(userId);
            if (stream) {
                const newComment = await LiveComment.create({ userId, comment });
                stream.comments.push(newComment);
                io.to(userId).emit('receiveComment', newComment);
            }
        });

        socket.on('sendLike', async ({ userId }) => {
            if (!userId) return socket.emit('error', 'userId is required');
            
            const stream = liveStreams.get(userId);
            if (stream) {
                const [like, created] = await LiveLike.findOrCreate({ where: { userId } });
                if (created) {
                    stream.likes += 1;
                    stream.likeUsers.add(userId);
                    io.to(userId).emit('updateLikes', stream.likes);
                }
            }
        });

        socket.on('getStreamInfo', async ({ userId }, callback) => {
            if (!userId) return callback({ error: 'userId is required' });
            
            const stream = liveStreams.get(userId);
            if (stream) {
                const comments = await LiveComment.findAll({ where: { userId }, limit: 50, order: [['createdAt', 'DESC']] });
                const likes = await LiveLike.count({ where: { userId } });
                const viewers = stream.viewers.size;
                callback({
                    viewers,
                    likes,
                    comments,
                    duration: Math.floor((new Date() - stream.startTime) / 1000)
                });
            }
        });

        socket.on('endStream', async ({ userId }) => {
            if (liveStreams.has(userId)) {
                await LiveStream.update({ isActive: false }, { where: { id: userId } });
                io.to(userId).emit('streamEnded');
                liveStreams.delete(userId);
                io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                console.log(`⏹️ Stream of ${userId} ended`);
            }
        });

        socket.on('disconnect', async () => {
            if (currentUserId) {
                const stream = liveStreams.get(currentUserId);
                if (stream && stream.hostId === currentUserId) {
                    await LiveStream.update({ isActive: false }, { where: { id: currentUserId } });
                    io.to(currentUserId).emit('streamEnded');
                    liveStreams.delete(currentUserId);
                    io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                    console.log(`⏹️ Stream of ${currentUserId} ended due to host disconnect`);
                }
            }
            console.log('❌ User disconnected:', socket.id);
        });
    });
};
