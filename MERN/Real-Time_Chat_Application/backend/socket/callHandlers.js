const Call = require('../models/Call');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const activeCalls = new Map();

const setupCallHandlers = (io, socket) => {

    // Initiate call
    socket.on('call:initiate', async (data) => {
        try {
            const { conversationId, receiverId, type } = data;
            const roomId = uuidv4();

            // Create call record
            const call = new Call({
                conversationId,
                caller: socket.userId,
                receiver: receiverId,
                participants: [socket.userId, receiverId],
                type,
                roomId,
                status: 'initiated'
            });

            await call.save();
            await call.populate('caller', '-password');

            activeCalls.set(roomId, {
                callId: call._id,
                participants: new Set([socket.userId])
            });

            // Notify receiver
            const receiverSocketId = Array.from(io.sockets.sockets.values())
                .find(s => s.userId === receiverId)?.id;

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:incoming', {
                    call,
                    roomId,
                    caller: call.caller
                });

                // Update status to ringing
                call.status = 'ringing';
                await call.save();

                socket.emit('call:initiated', { call, roomId });
            } else {
                // User is offline
                call.status = 'missed';
                await call.save();
                socket.emit('call:failed', { error: 'User is offline' });
            }

        } catch (error) {
            logger.error('Call initiation error:', error);
            socket.emit('call:failed', { error: 'Failed to initiate call' });
        }
    });

    // Accept call
    socket.on('call:accept', async (data) => {
        try {
            const { roomId } = data;

            const call = await Call.findOne({ roomId, status: 'ringing' });
            if (!call) {
                return socket.emit('call:failed', { error: 'Call not found' });
            }

            // Update call status
            call.status = 'ongoing';
            call.startedAt = new Date();
            await call.save();

            // Join room
            socket.join(roomId);

            const callData = activeCalls.get(roomId);
            if (callData) {
                callData.participants.add(socket.userId);
            }

            // Notify all participants
            io.to(roomId).emit('call:accepted', {
                roomId,
                userId: socket.userId
            });

        } catch (error) {
            logger.error('Call accept error:', error);
            socket.emit('call:failed', { error: 'Failed to accept call' });
        }
    });

    // Reject call
    socket.on('call:reject', async (data) => {
        try {
            const { roomId } = data;

            const call = await Call.findOne({ roomId });
            if (call) {
                call.status = 'rejected';
                await call.save();
            }

            // Notify caller
            io.to(roomId).emit('call:rejected', { roomId });

            activeCalls.delete(roomId);

        } catch (error) {
            logger.error('Call reject error:', error);
        }
    });

    // End call
    socket.on('call:end', async (data) => {
        try {
            const { roomId } = data;

            const call = await Call.findOne({ roomId });
            if (call && call.status === 'ongoing') {
                call.status = 'ended';
                call.endedAt = new Date();
                await call.save();
            }

            // Notify all participants
            io.to(roomId).emit('call:ended', { roomId });

            // Clean up
            activeCalls.delete(roomId);

        } catch (error) {
            logger.error('Call end error:', error);
        }
    });

    // WebRTC signaling - Offer
    socket.on('webrtc:offer', (data) => {
        const { roomId, offer, to } = data;

        if (to) {
            io.to(to).emit('webrtc:offer', {
                from: socket.id,
                offer
            });
        } else {
            socket.to(roomId).emit('webrtc:offer', {
                from: socket.id,
                offer
            });
        }
    });

    // WebRTC signaling - Answer
    socket.on('webrtc:answer', (data) => {
        const { roomId, answer, to } = data;

        if (to) {
            io.to(to).emit('webrtc:answer', {
                from: socket.id,
                answer
            });
        } else {
            socket.to(roomId).emit('webrtc:answer', {
                from: socket.id,
                answer
            });
        }
    });

    // WebRTC signaling - ICE Candidate
    socket.on('webrtc:ice-candidate', (data) => {
        const { roomId, candidate, to } = data;

        if (to) {
            io.to(to).emit('webrtc:ice-candidate', {
                from: socket.id,
                candidate
            });
        } else {
            socket.to(roomId).emit('webrtc:ice-candidate', {
                from: socket.id,
                candidate
            });
        }
    });

    // Join call room
    socket.on('call:join', async (data) => {
        const { roomId } = data;
        socket.join(roomId);

        const callData = activeCalls.get(roomId);
        if (callData) {
            callData.participants.add(socket.userId);

            // Notify other participants
            socket.to(roomId).emit('call:participant-joined', {
                userId: socket.userId,
                socketId: socket.id
            });
        }
    });

    // Leave call room
    socket.on('call:leave', (data) => {
        const { roomId } = data;
        socket.leave(roomId);

        const callData = activeCalls.get(roomId);
        if (callData) {
            callData.participants.delete(socket.userId);

            // Notify other participants
            socket.to(roomId).emit('call:participant-left', {
                userId: socket.userId
            });
        }
    });
};

module.exports = { setupCallHandlers, activeCalls };