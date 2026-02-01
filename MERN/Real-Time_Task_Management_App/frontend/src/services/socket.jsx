import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export const initSocket = () => {
    if (socket && socket.connected) return socket;
    //process.env.REACT_APP_SOCKET_URL || 
    const SOCKET_URL = 'http://localhost:5000';

    socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('✅ Connected to server with ID:', socket.id);
        reconnectAttempts = 0;
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);

        if (reason === 'io server disconnect') {
            // Server disconnected the socket, manually reconnect
            socket.connect();
        }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
        reconnectAttempts = attemptNumber;
        console.log(`🔄 Reconnection attempt ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS}`);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('✅ Reconnected after', attemptNumber, 'attempts');
        reconnectAttempts = 0;
        // Request full sync after reconnection
        socket.emit('tasks:requestSync');
    });

    socket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect after maximum attempts');
    });

    socket.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('🔴 Socket error:', error);
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn('⚠️ Socket not initialized, initializing now...');
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket disconnected and cleaned up');
    }
};

export const isSocketConnected = () => {
    return socket && socket.connected;
};

