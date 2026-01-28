import { io } from 'socket.io-client';
//process.env.REACT_APP_SOCKET_URL || 
const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    on(event, callback) {
        if (!this.socket) return;

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        this.socket.on(event, callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);

            // Remove from listeners
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        } else {
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }

    // Message events
    sendMessage(data) {
        this.emit('message:send', data);
    }

    editMessage(data) {
        this.emit('message:edit', data);
    }

    deleteMessage(data) {
        this.emit('message:delete', data);
    }

    markAsRead(data) {
        this.emit('message:read', data);
    }

    // Typing events
    startTyping(conversationId) {
        this.emit('typing:start', { conversationId });
    }

    stopTyping(conversationId) {
        this.emit('typing:stop', { conversationId });
    }

    // Conversation events
    joinConversation(conversationId) {
        this.emit('conversation:join', { conversationId });
    }

    leaveConversation(conversationId) {
        this.emit('conversation:leave', { conversationId });
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

const socketService = new SocketService();
export default socketService;