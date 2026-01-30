import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMonitor, FiMaximize2 } from 'react-icons/fi';
import webrtcService from '../services/webrtc';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import '../styles/VideoCall.css';

const VideoCall = ({ call, onEnd }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(call.type === 'video');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef(new Map());
    const callContainerRef = useRef(null);
    const durationIntervalRef = useRef(null);

    useEffect(() => {
        initializeCall();

        // Setup socket listeners
        socketService.on('webrtc:offer', handleOffer);
        socketService.on('webrtc:answer', handleAnswer);
        socketService.on('webrtc:ice-candidate', handleIceCandidate);
        socketService.on('call:participant-joined', handleParticipantJoined);
        socketService.on('call:participant-left', handleParticipantLeft);
        socketService.on('call:ended', handleCallEnded);

        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            cleanup();
            socketService.off('webrtc:offer', handleOffer);
            socketService.off('webrtc:answer', handleAnswer);
            socketService.off('webrtc:ice-candidate', handleIceCandidate);
            socketService.off('call:participant-joined', handleParticipantJoined);
            socketService.off('call:participant-left', handleParticipantLeft);
            socketService.off('call:ended', handleCallEnded);

            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    const initializeCall = async () => {
        try {
            const stream = await webrtcService.getMediaStream(true, call.type === 'video');
            setLocalStream(stream);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Join the call room
            socketService.emit('call:join', { roomId: call.roomId });

        } catch (error) {
            console.error('Failed to initialize call:', error);
            toast.error('Failed to access camera/microphone');
            onEnd();
        }
    };

    const handleOffer = ({ from, offer }) => {
        const peer = webrtcService.handleOffer(offer, from, call.roomId);

        peer.on('stream', (stream) => {
            setRemoteStreams(prev => new Map(prev).set(from, stream));

            const videoElement = remoteVideoRefs.current.get(from);
            if (videoElement) {
                videoElement.srcObject = stream;
            }
        });
    };

    const handleAnswer = ({ from, answer }) => {
        webrtcService.handleAnswer(answer, from);
    };

    const handleIceCandidate = ({ from, candidate }) => {
        webrtcService.handleIceCandidate(candidate, from);
    };

    const handleParticipantJoined = ({ socketId }) => {
        if (!webrtcService.localStream) return;

        const peer = webrtcService.createPeer(true, webrtcService.localStream, call.roomId, socketId);

        peer.on('stream', (stream) => {
            setRemoteStreams(prev => new Map(prev).set(socketId, stream));
        });
    };

    const handleParticipantLeft = ({ userId }) => {
        setRemoteStreams(prev => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
        });
    };

    const handleCallEnded = () => {
        toast.info('Call ended');
        onEnd();
    };

    const cleanup = () => {
        webrtcService.endCall();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleAudio = () => {
        webrtcService.toggleAudio(!audioEnabled);
        setAudioEnabled(!audioEnabled);
    };

    const toggleVideo = () => {
        webrtcService.toggleVideo(!videoEnabled);
        setVideoEnabled(!videoEnabled);
    };

    const toggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                const stream = await webrtcService.getMediaStream(true, true);
                webrtcService.switchStream(stream);
                setLocalStream(stream);
                setIsScreenSharing(false);
            } else {
                const screenStream = await webrtcService.shareScreen();
                webrtcService.switchStream(screenStream);
                setLocalStream(screenStream);
                setIsScreenSharing(true);

                screenStream.getVideoTracks()[0].onended = () => {
                    toggleScreenShare();
                };
            }
        } catch (error) {
            console.error('Screen share error:', error);
            toast.error('Failed to share screen');
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            callContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const endCall = () => {
        socketService.emit('call:end', { roomId: call.roomId });
        onEnd();
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                className="video-call-container"
                ref={callContainerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="call-header">
                    <div className="call-info">
                        <span className="call-title">{call.caller?.username}</span>
                        <span className="call-duration">{formatDuration(callDuration)}</span>
                    </div>
                </div>

                <div className="video-grid">
                    {/* Remote videos */}
                    {Array.from(remoteStreams.entries()).map(([id, stream]) => (
                        <div key={id} className="video-wrapper remote-video">
                            <video
                                ref={el => {
                                    if (el) {
                                        remoteVideoRefs.current.set(id, el);
                                        el.srcObject = stream;
                                    }
                                }}
                                autoPlay
                                playsInline
                            />
                        </div>
                    ))}

                    {/* Local video */}
                    <div className="video-wrapper local-video">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={!videoEnabled ? 'video-off' : ''}
                        />
                        {!videoEnabled && (
                            <div className="video-placeholder">
                                <div className="avatar-placeholder">
                                    {call.caller?.username?.[0]?.toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="call-controls">
                    <motion.button
                        className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
                        onClick={toggleAudio}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={audioEnabled ? 'Mute' : 'Unmute'}
                    >
                        {audioEnabled ? <FiMic size={24} /> : <FiMicOff size={24} />}
                    </motion.button>

                    {call.type === 'video' && (
                        <motion.button
                            className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                            onClick={toggleVideo}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={videoEnabled ? 'Stop video' : 'Start video'}
                        >
                            {videoEnabled ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
                        </motion.button>
                    )}

                    {call.type === 'video' && (
                        <motion.button
                            className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                            onClick={toggleScreenShare}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Share screen"
                        >
                            <FiMonitor size={24} />
                        </motion.button>
                    )}

                    <motion.button
                        className="control-btn"
                        onClick={toggleFullscreen}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Fullscreen"
                    >
                        <FiMaximize2 size={24} />
                    </motion.button>

                    <motion.button
                        className="control-btn end-call"
                        onClick={endCall}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="End call"
                    >
                        <FiPhoneOff size={24} />
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VideoCall;