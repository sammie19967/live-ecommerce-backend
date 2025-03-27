import LiveStream from '../models/LiveStream.js';
import LiveComment from '../models/LiveComment.js';
import LiveLike from '../models/LiveLike.js';
import LiveView from '../models/LiveView.js';

const liveStreams = new Map(); // Store active streams by userId

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);
        let currentUserStream = null;

        socket.on('startStream', async ({ userId }) => {
            console.log('📡 startStream event received:', { userId });

            if (!userId) {
                console.error('❌ userId is missing in startStream');
                return socket.emit('error', 'userId is required');
            }

            try {
                // Check if user already has an active stream
                const existingStream = await LiveStream.findOne({ where: { userId, isActive: true } });
                if (existingStream) {
                    return socket.emit('error', '❌ You are already streaming.');
                }

                // Start a new stream
                await LiveStream.upsert({ userId, isActive: true });
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
                currentUserStream = userId;
                io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                console.log(`🎥 Host ${userId} started a live stream`);
            } catch (error) {
                console.error('🔥 Error in startStream:', error);
                socket.emit('error', 'Failed to start stream');
            }
        });

        socket.on('joinStream', async ({ userId }) => {
            console.log('👥 joinStream event received:', { userId });

            if (!userId) {
                console.error('❌ userId is missing in joinStream');
                return socket.emit('error', 'userId is required');
            }

            const stream = await LiveStream.findOne({ where: { userId, isActive: true } });
            if (!stream) {
                return socket.emit('error', 'Stream is not active.');
            }

            let liveStream = liveStreams.get(userId);
            if (!liveStream) {
                return socket.emit('error', 'Stream is not active.');
            }

            if (!liveStream.viewers.has(userId)) {
                liveStream.viewers.set(userId, socket.id);
                await LiveView.findOrCreate({ where: { userId } });
            }

            socket.join(userId);
            io.to(userId).emit('streamUpdate', {
                viewers: liveStream.viewers.size,
                likes: liveStream.likes,
                comments: liveStream.comments.slice(-50)
            });

            console.log(`👀 Viewer ${userId} joined stream`);
        });

        socket.on('sendComment', async ({ userId, comment }) => {
            console.log('💬 sendComment event received:', { userId, comment });

            if (!userId || !comment) {
                console.error('❌ Missing userId or comment in sendComment');
                return socket.emit('error', 'userId and comment are required');
            }

            const stream = liveStreams.get(userId);
            if (stream) {
                const newComment = await LiveComment.create({ userId, comment });
                stream.comments.push(newComment);
                io.to(userId).emit('receiveComment', newComment);
            }
        });

        socket.on('sendLike', async ({ userId }) => {
            console.log('❤️ sendLike event received:', { userId });

            if (!userId) {
                console.error('❌ userId is missing in sendLike');
                return socket.emit('error', 'userId is required');
            }

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
            console.log('📊 getStreamInfo event received:', { userId });

            if (!userId) {
                console.error('❌ userId is missing in getStreamInfo');
                return socket.emit('error', 'userId is required');
            }

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
            console.log('🛑 endStream event received:', { userId });

            if (!userId) {
                console.error('❌ userId is missing in endStream');
                return socket.emit('error', 'userId is required');
            }

            if (liveStreams.has(userId)) {
                await LiveStream.update({ isActive: false }, { where: { userId } });
                io.to(userId).emit('streamEnded');
                liveStreams.delete(userId);
                io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                console.log(`⏹️ Stream for ${userId} ended`);
            }
        });

        socket.on('disconnect', async () => {
            console.log('❌ User disconnected:', socket.id);

            if (currentUserStream) {
                const stream = liveStreams.get(currentUserStream);
                if (stream) {
                    if (stream.hostId === socket.id) {
                        await LiveStream.update({ isActive: false }, { where: { userId: currentUserStream } });
                        io.to(currentUserStream).emit('streamEnded');
                        liveStreams.delete(currentUserStream);
                        io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                        console.log(`⏹️ Stream for ${currentUserStream} ended due to host disconnect`);
                    } else {
                        for (const [viewerUserId, viewerSocketId] of stream.viewers.entries()) {
                            if (viewerSocketId === socket.id) {
                                stream.viewers.delete(viewerUserId);
                                break;
                            }
                        }
                        io.to(currentUserStream).emit('viewerLeft', { viewers: stream.viewers.size });
                    }
                }
            }
        });
    });
};
