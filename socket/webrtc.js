import LiveStream from '../models/LiveStream.js';
import LiveComment from '../models/LiveComment.js';
import LiveLike from '../models/LiveLike.js';
import LiveView from '../models/LiveView.js';

const liveStreams = new Map();

export const setupWebRTC = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);
        let currentStream = null;

        socket.on('startStream', async ({ hostId, streamId }) => {
            await LiveStream.update({ isActive: true }, { where: { id: streamId } });
            liveStreams.set(streamId, {
                hostId,
                viewers: new Set(),
                likes: 0,
                likeUsers: new Set(),
                comments: [],
                startTime: new Date(),
                status: 'live'
            });
            socket.join(streamId);
            currentStream = streamId;
            io.emit('streamListUpdated', Array.from(liveStreams.keys()));
            console.log(`🎥 Host ${hostId} started stream ${streamId}`);
        });

        socket.on('joinStream', async ({ streamId, userId }) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                stream.viewers.add(userId);
                socket.join(streamId);
                currentStream = streamId;
                await LiveView.findOrCreate({ where: { streamId, userId } });
                io.to(streamId).emit('streamUpdate', {
                    viewers: stream.viewers.size,
                    likes: stream.likes,
                    comments: stream.comments.slice(-50)
                });
                console.log(`👀 Viewer ${userId} joined stream ${streamId}`);
            }
        });

        socket.on('sendComment', async ({ streamId, userId, comment }) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                const newComment = await LiveComment.create({ streamId, userId, comment });
                stream.comments.push(newComment);
                io.to(streamId).emit('receiveComment', newComment);
            }
        });

        socket.on('sendLike', async ({ streamId, userId }) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                const [like, created] = await LiveLike.findOrCreate({ where: { streamId, userId } });
                if (created) {
                    stream.likes += 1;
                    stream.likeUsers.add(userId);
                    io.to(streamId).emit('updateLikes', stream.likes);
                }
            }
        });

        socket.on('getStreamInfo', async ({ streamId }, callback) => {
            const stream = liveStreams.get(streamId);
            if (stream) {
                const comments = await LiveComment.findAll({ where: { streamId }, limit: 50, order: [['createdAt', 'DESC']] });
                const likes = await LiveLike.count({ where: { streamId } });
                const viewers = await LiveView.count({ where: { streamId } });
                callback({
                    viewers,
                    likes,
                    comments,
                    duration: Math.floor((new Date() - stream.startTime) / 1000)
                });
            }
        });

        socket.on('endStream', async ({ streamId }) => {
            if (liveStreams.has(streamId)) {
                await LiveStream.update({ isActive: false }, { where: { id: streamId } });
                io.to(streamId).emit('streamEnded');
                liveStreams.delete(streamId);
                io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                console.log(`⏹️ Stream ${streamId} ended`);
            }
        });

        socket.on('disconnect', async () => {
            if (currentStream) {
                const stream = liveStreams.get(currentStream);
                if (stream) {
                    if (stream.hostId === socket.id) {
                        await LiveStream.update({ isActive: false }, { where: { id: currentStream } });
                        io.to(currentStream).emit('streamEnded');
                        liveStreams.delete(currentStream);
                        io.emit('streamListUpdated', Array.from(liveStreams.keys()));
                        console.log(`⏹️ Stream ${currentStream} ended due to host disconnect`);
                    } else if (stream.viewers.has(socket.id)) {
                        stream.viewers.delete(socket.id);
                        io.to(currentStream).emit('viewerLeft', { viewers: stream.viewers.size });
                    }
                }
            }
            console.log('❌ User disconnected:', socket.id);
        });
    });
};
