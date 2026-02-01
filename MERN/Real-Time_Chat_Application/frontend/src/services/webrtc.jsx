// import SimplePeer from 'simple-peer';
// import socketService from './socket';

// class WebRTCService {
//     constructor() {
//         this.peers = new Map();
//         this.localStream = null;
//         this.currentCall = null;
//     }

//     async getMediaStream(audio = true, video = true) {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: audio ? {
//                     echoCancellation: true,
//                     noiseSuppression: true,
//                     autoGainControl: true
//                 } : false,
//                 video: video ? {
//                     width: { ideal: 1280 },
//                     height: { ideal: 720 },
//                     facingMode: 'user'
//                 } : false
//             });

//             this.localStream = stream;
//             return stream;
//         } catch (error) {
//             console.error('Error accessing media devices:', error);
//             throw error;
//         }
//     }

//     async initiateCall(receiverId, conversationId, type = 'video') {
//         try {
//             const stream = await this.getMediaStream(true, type === 'video');

//             socketService.emit('call:initiate', {
//                 receiverId,
//                 conversationId,
//                 type
//             });

//             return stream;
//         } catch (error) {
//             console.error('Failed to initiate call:', error);
//             throw error;
//         }
//     }

//     createPeer(initiator, stream, roomId, socketId) {
//         const peer = new SimplePeer({
//             initiator,
//             stream,
//             trickle: true,
//             config: {
//                 iceServers: [
//                     { urls: 'stun:stun.l.google.com:19302' },
//                     { urls: 'stun:stun1.l.google.com:19302' }
//                 ]
//             }
//         });

//         peer.on('signal', (signal) => {
//             if (signal.type === 'offer') {
//                 socketService.emit('webrtc:offer', {
//                     roomId,
//                     offer: signal,
//                     to: socketId
//                 });
//             } else if (signal.type === 'answer') {
//                 socketService.emit('webrtc:answer', {
//                     roomId,
//                     answer: signal,
//                     to: socketId
//                 });
//             }
//         });

//         peer.on('connect', () => {
//             console.log('Peer connected');
//         });

//         peer.on('error', (err) => {
//             console.error('Peer error:', err);
//         });

//         peer.on('close', () => {
//             console.log('Peer closed');
//             this.removePeer(socketId);
//         });

//         this.peers.set(socketId, peer);
//         return peer;
//     }

//     handleOffer(offer, from, roomId) {
//         const peer = this.createPeer(false, this.localStream, roomId, from);
//         peer.signal(offer);
//         return peer;
//     }

//     handleAnswer(answer, from) {
//         const peer = this.peers.get(from);
//         if (peer) {
//             peer.signal(answer);
//         }
//     }

//     handleIceCandidate(candidate, from) {
//         const peer = this.peers.get(from);
//         if (peer) {
//             peer.signal(candidate);
//         }
//     }

//     removePeer(socketId) {
//         const peer = this.peers.get(socketId);
//         if (peer) {
//             peer.destroy();
//             this.peers.delete(socketId);
//         }
//     }

//     toggleAudio(enabled) {
//         if (this.localStream) {
//             this.localStream.getAudioTracks().forEach(track => {
//                 track.enabled = enabled;
//             });
//         }
//     }

//     toggleVideo(enabled) {
//         if (this.localStream) {
//             this.localStream.getVideoTracks().forEach(track => {
//                 track.enabled = enabled;
//             });
//         }
//     }

//     endCall() {
//         // Stop all tracks
//         if (this.localStream) {
//             this.localStream.getTracks().forEach(track => track.stop());
//             this.localStream = null;
//         }

//         // Destroy all peers
//         this.peers.forEach(peer => peer.destroy());
//         this.peers.clear();

//         this.currentCall = null;
//     }

//     async shareScreen() {
//         try {
//             const screenStream = await navigator.mediaDevices.getDisplayMedia({
//                 video: {
//                     cursor: 'always'
//                 },
//                 audio: false
//             });

//             return screenStream;
//         } catch (error) {
//             console.error('Screen sharing error:', error);
//             throw error;
//         }
//     }

//     switchStream(newStream) {
//         this.peers.forEach(peer => {
//             const sender = peer._pc.getSenders().find(s =>
//                 s.track && s.track.kind === 'video'
//             );

//             if (sender) {
//                 sender.replaceTrack(newStream.getVideoTracks()[0]);
//             }
//         });

//         // Stop old stream
//         if (this.localStream) {
//             this.localStream.getVideoTracks().forEach(track => track.stop());
//         }

//         this.localStream = newStream;
//     }
// }

// const webrtcService = new WebRTCService();
// export default webrtcService;


import SimplePeer from 'simple-peer';
import socketService from './socket';

class WebRTCService {
    constructor() {
        this.peers = new Map();
        this.localStream = null;
        this.currentCall = null;
    }

    async getMediaStream(audio = true, video = true) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false,
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false
            });

            this.localStream = stream;
            return stream;
        } catch (error) {
            // Silently handle permission errors - they're expected
            if (error.name === 'NotAllowedError') {
                // User denied permission - this is normal
                return null;
            } else if (error.name === 'NotFoundError') {
                console.warn('No camera/microphone found');
                return null;
            } else if (error.name === 'NotReadableError') {
                console.warn('Camera/microphone in use by another application');
                return null;
            } else {
                console.error('Error accessing media devices:', error);
                return null;
            }
        }
    }

    async initiateCall(receiverId, conversationId, type = 'video') {
        try {
            const stream = await this.getMediaStream(true, type === 'video');

            if (!stream) {
                // Permission denied or no device - return error object
                return {
                    error: true,
                    message: 'Camera/microphone access required. Please allow permissions in browser settings.'
                };
            }

            socketService.emit('call:initiate', {
                receiverId,
                conversationId,
                type
            });

            return stream;
        } catch (error) {
            console.error('Failed to initiate call:', error);
            return {
                error: true,
                message: 'Failed to start call. Please try again.'
            };
        }
    }

    createPeer(initiator, stream, roomId, socketId) {
        const peer = new SimplePeer({
            initiator,
            stream,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('signal', (signal) => {
            if (signal.type === 'offer') {
                socketService.emit('webrtc:offer', {
                    roomId,
                    offer: signal,
                    to: socketId
                });
            } else if (signal.type === 'answer') {
                socketService.emit('webrtc:answer', {
                    roomId,
                    answer: signal,
                    to: socketId
                });
            }
        });

        peer.on('connect', () => {
            console.log('Peer connected');
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
        });

        peer.on('close', () => {
            console.log('Peer closed');
            this.removePeer(socketId);
        });

        this.peers.set(socketId, peer);
        return peer;
    }

    handleOffer(offer, from, roomId) {
        const peer = this.createPeer(false, this.localStream, roomId, from);
        peer.signal(offer);
        return peer;
    }

    handleAnswer(answer, from) {
        const peer = this.peers.get(from);
        if (peer) {
            peer.signal(answer);
        }
    }

    handleIceCandidate(candidate, from) {
        const peer = this.peers.get(from);
        if (peer) {
            peer.signal(candidate);
        }
    }

    removePeer(socketId) {
        const peer = this.peers.get(socketId);
        if (peer) {
            peer.destroy();
            this.peers.delete(socketId);
        }
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    toggleVideo(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    endCall() {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Destroy all peers
        this.peers.forEach(peer => peer.destroy());
        this.peers.clear();

        this.currentCall = null;
    }

    async shareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            });

            return screenStream;
        } catch (error) {
            console.error('Screen sharing error:', error);
            throw error;
        }
    }

    switchStream(newStream) {
        this.peers.forEach(peer => {
            const sender = peer._pc.getSenders().find(s =>
                s.track && s.track.kind === 'video'
            );

            if (sender) {
                sender.replaceTrack(newStream.getVideoTracks()[0]);
            }
        });

        // Stop old stream
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => track.stop());
        }

        this.localStream = newStream;
    }
}

const webrtcService = new WebRTCService();
export default webrtcService;