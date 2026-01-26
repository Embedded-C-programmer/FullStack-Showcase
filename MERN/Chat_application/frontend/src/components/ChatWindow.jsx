import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles/ChatWindow.css';

const EMOJI_CATEGORIES = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪'],
    gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤'],
    food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🚲', '🛵', '🏍', '🛺'],
    objects: ['⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '📷', '📸', '📹', '🎥', '📞', '☎️', '📺', '📻', '🎙']
};

function ChatWindow({ chat }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [socket, setSocket] = useState(null);
    const [files, setFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCallModal, setShowCallModal] = useState(false);
    const [callType, setCallType] = useState('voice'); // 'voice' or 'video'
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const messageIdsRef = useRef(new Set());

    useEffect(() => {
        let newSocket = null;

        try {
            newSocket = io('http://localhost:5000', {
                auth: { token: localStorage.getItem('token') },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
                newSocket.emit('join-chat', chat._id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            newSocket.on('receive-message', (msg) => {
                // Prevent duplicate messages
                if (!messageIdsRef.current.has(msg._id)) {
                    messageIdsRef.current.add(msg._id);
                    setMessages(prev => {
                        // Double check we don't have it already
                        if (prev.some(m => m._id === msg._id)) {
                            return prev;
                        }
                        return [...prev, msg];
                    });
                }
            });

            newSocket.on('user-typing', ({ userId, isTyping }) => {
                setTyping(isTyping);
            });

            setSocket(newSocket);
        } catch (error) {
            console.error('Socket setup error:', error);
        }

        return () => {
            if (newSocket) {
                newSocket.emit('leave-chat', chat._id);
                newSocket.close();
            }
        };
    }, [chat._id]);

    useEffect(() => {
        fetchMessages();
    }, [chat._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${chat._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            // Clear and rebuild message IDs
            messageIdsRef.current.clear();
            if (Array.isArray(data)) {
                data.forEach(msg => messageIdsRef.current.add(msg._id));
                setMessages(data);
            }
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing', { chatId: chat._id, isTyping: true });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { chatId: chat._id, isTyping: false });
            }, 1000);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        // Don't close picker immediately - let user select multiple
        // User can click outside or press escape to close
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const emojiPicker = document.querySelector('.emoji-picker-container');
            const emojiButton = document.querySelector('.emoji-picker-button');

            if (showEmojiPicker &&
                emojiPicker &&
                !emojiPicker.contains(event.target) &&
                emojiButton &&
                !emojiButton.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showEmojiPicker]);

    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                setFiles(prev => [...prev, file]);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone');
        }
    };

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            setRecordingTime(0);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.includes('zip') || type.includes('rar')) return '🗜️';
        return '📎';
    };

    const sendMessage = async () => {
        if ((!message.trim() && files.length === 0) || !socket) return;

        try {
            // For text-only messages (no files)
            if (files.length === 0) {
                const response = await fetch('http://localhost:5000/api/messages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: message,
                        chatId: chat._id
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error sending message:', errorData);
                    alert('Failed to send message: ' + (errorData.message || 'Unknown error'));
                    return;
                }

                const newMessage = await response.json();

                // Add to message IDs to prevent duplicates
                if (!messageIdsRef.current.has(newMessage._id)) {
                    messageIdsRef.current.add(newMessage._id);
                    socket.emit('send-message', newMessage);

                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) {
                            return prev;
                        }
                        return [...prev, newMessage];
                    });
                }

                setMessage('');
                setFiles([]);
                scrollToBottom();
            } else {
                // For messages with files
                const formData = new FormData();
                formData.append('content', message);
                formData.append('chatId', chat._id);
                files.forEach(file => formData.append('files', file));

                const response = await fetch('http://localhost:5000/api/messages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error sending message:', errorData);
                    alert('Failed to send message: ' + (errorData.message || 'Unknown error'));
                    return;
                }

                const newMessage = await response.json();

                if (!messageIdsRef.current.has(newMessage._id)) {
                    messageIdsRef.current.add(newMessage._id);
                    socket.emit('send-message', newMessage);

                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) {
                            return prev;
                        }
                        return [...prev, newMessage];
                    });
                }

                setMessage('');
                setFiles([]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Network error. Please check your connection.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = (date) => {
        if (!date) return '';
        const messageDate = new Date(date);
        const hours = messageDate.getHours().toString().padStart(2, '0');
        const minutes = messageDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getChatName = () => {
        if (chat.isGroupChat) {
            return chat.name || 'Group Chat';
        }
        return chat.participants?.[0]?.username || 'Unknown User';
    };

    const filteredMessages = searchQuery
        ? messages.filter(msg => msg.content?.toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;

    const startCall = (type) => {
        setCallType(type);
        setShowCallModal(true);
    };

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="status-indicator online">
                        <img
                            src={`https://ui-avatars.com/api/?name=${getChatName()}&background=random`}
                            alt={getChatName()}
                            className="avatar avatar-lg"
                        />
                    </div>
                    <div className="chat-user-info">
                        <div className="chat-user-name">{getChatName()}</div>
                        <div className="chat-user-status">
                            {typing ? (
                                <>
                                    <div className="typing-indicator-small">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    typing...
                                </>
                            ) : (
                                'Online'
                            )}
                        </div>
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button className="chat-action-btn" title="Voice Call" onClick={() => startCall('voice')}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                    <button className="chat-action-btn" title="Video Call" onClick={() => startCall('video')}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button className="chat-action-btn" title="Search" onClick={() => setShowSearchModal(true)}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="chat-action-btn" title="More" onClick={() => setShowMoreMenu(!showMoreMenu)} style={{ position: 'relative' }}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>

                        {showMoreMenu && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                right: '0',
                                background: 'var(--light-bg)',
                                border: '2px solid var(--border-color)',
                                borderRadius: 'var(--border-radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                minWidth: '200px',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <button className="dropdown-item" onClick={() => { alert('View Profile'); setShowMoreMenu(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    View Profile
                                </button>
                                <button className="dropdown-item" onClick={() => { alert('Mute Chat'); setShowMoreMenu(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                    Mute Chat
                                </button>
                                <button className="dropdown-item" onClick={() => { alert('Block User'); setShowMoreMenu(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Block User
                                </button>
                                <button className="dropdown-item" onClick={() => { alert('Report Chat'); setShowMoreMenu(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Report
                                </button>
                                <button className="dropdown-item danger" onClick={() => { if (window.confirm('Delete this chat?')) alert('Chat Deleted'); setShowMoreMenu(false); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Chat
                                </button>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty-state">
                        <svg className="chat-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3>No messages yet</h3>
                        <p>Start the conversation by sending a message</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => {
                        const currentUserId = localStorage.getItem('userId');
                        const isSent = msg.sender?._id === currentUserId;

                        return (
                            <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                                <div className="message-content">
                                    {msg.content && <div className="message-text">{msg.content}</div>}
                                    <div className="message-meta">
                                        <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                                        {isSent && (
                                            <span className="message-status">
                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {typing && (
                    <div className="typing-indicator">
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                {files.length > 0 && (
                    <div className="file-preview-container">
                        {files.map((file, index) => (
                            <div key={index} className={`file-preview-item ${file.type.startsWith('image/') ? 'image-preview' : ''}`}>
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} alt={file.name} />
                                ) : (
                                    <>
                                        <div className="attachment-icon">{getFileIcon(file.type)}</div>
                                        <div className="attachment-info">
                                            <div className="attachment-name">{file.name}</div>
                                            <div className="attachment-size">{formatFileSize(file.size)}</div>
                                        </div>
                                    </>
                                )}
                                <button className="file-preview-remove" onClick={() => removeFile(index)}>×</button>
                            </div>
                        ))}
                    </div>
                )}

                {isRecording && (
                    <div className="recording-indicator">
                        <div className="recording-dot"></div>
                        <span>Recording... {formatRecordingTime(recordingTime)}</span>
                        <button className="btn btn-danger btn-sm" onClick={stopVoiceRecording}>Stop</button>
                    </div>
                )}

                <div className="input-container">
                    <div className="input-actions">
                        <button className="input-action-btn" title="Attach File" onClick={() => fileInputRef.current?.click()}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                        </button>

                        <button className="input-action-btn" title="Attach Image" onClick={() => imageInputRef.current?.click()}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                        </button>

                        <button
                            className="input-action-btn"
                            title={isRecording ? "Recording..." : "Voice Message"}
                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                            style={{ color: isRecording ? '#d63031' : undefined }}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        <button
                            className="input-action-btn emoji-picker-button"
                            title="Emoji"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(!showEmojiPicker);
                            }}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>

                    <textarea
                        className="message-input"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        rows="1"
                    />

                    <button
                        className="send-button"
                        onClick={sendMessage}
                        disabled={!message.trim() && files.length === 0}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>

                {showEmojiPicker && (
                    <div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '0.75rem',
                            borderBottom: '2px solid var(--border-color)',
                            marginBottom: '0.75rem'
                        }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Select Emoji
                            </div>
                            <button
                                onClick={() => setShowEmojiPicker(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="emoji-categories">
                            {Object.keys(EMOJI_CATEGORIES).map(category => (
                                <button
                                    key={category}
                                    className={`emoji-category-btn ${emojiCategory === category ? 'active' : ''}`}
                                    onClick={() => setEmojiCategory(category)}
                                    title={category}
                                >
                                    {EMOJI_CATEGORIES[category][0]}
                                </button>
                            ))}
                        </div>
                        <div className="emoji-grid">
                            {EMOJI_CATEGORIES[emojiCategory].map((emoji, index) => (
                                <button
                                    key={index}
                                    className="emoji-item"
                                    onClick={() => handleEmojiSelect(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSearchModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search Messages
                            </h2>
                            <button className="modal-close" onClick={() => setShowSearchModal(false)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search in conversation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius-md)',
                                    background: 'var(--darker-bg)',
                                    color: 'var(--text-primary)',
                                    marginBottom: '1rem'
                                }}
                            />
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filteredMessages.length > 0 ? (
                                    filteredMessages.map(msg => (
                                        <div key={msg._id} style={{
                                            padding: '0.75rem',
                                            background: 'var(--light-bg)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                {msg.sender?.username} - {formatMessageTime(msg.createdAt)}
                                            </div>
                                            <div>{msg.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                        {searchQuery ? 'No messages found' : 'Start typing to search'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setShowSearchModal(false); }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Modal */}
            {showCallModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCallModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {callType === 'voice' ? (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                ) : (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                                {callType === 'voice' ? 'Voice Call' : 'Video Call'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowCallModal(false)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${getChatName()}&size=128&background=random`}
                                alt={getChatName()}
                                style={{
                                    width: '128px',
                                    height: '128px',
                                    borderRadius: '50%',
                                    marginBottom: '1rem',
                                    border: '4px solid var(--primary-color)'
                                }}
                            />
                            <h3 style={{ marginBottom: '0.5rem' }}>{getChatName()}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Calling...</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    className="btn btn-success"
                                    style={{ borderRadius: '50%', width: '60px', height: '60px', padding: '0' }}
                                    title="Answer"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ borderRadius: '50%', width: '60px', height: '60px', padding: '0' }}
                                    onClick={() => setShowCallModal(false)}
                                    title="End Call"
                                >
                                    <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '28px', height: '28px' }}>
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" transform="rotate(135 10 10)" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatWindow;