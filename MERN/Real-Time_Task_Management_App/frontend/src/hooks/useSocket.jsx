// ==================== frontend/src/hooks/useSocket.js (ENHANCED) ====================
import { useEffect, useState, useRef } from 'react';
import { initSocket, getSocket, isSocketConnected } from '../services/socket';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket only once
        if (!socketRef.current) {
            socketRef.current = initSocket();
            setSocket(socketRef.current);
        }

        return () => {
            // Don't disconnect on unmount, keep connection alive
            // Only disconnect when app is closing
        };
    }, []);

    return socket;
};

export const useSocketStatus = () => {
    const [connected, setConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);
    const [reconnecting, setReconnecting] = useState(false);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) {
            console.warn('Socket not available in useSocketStatus');
            return;
        }

        const handleConnect = () => {
            setConnected(true);
            setReconnecting(false);
        };

        const handleDisconnect = () => {
            setConnected(false);
        };

        const handleReconnecting = () => {
            setReconnecting(true);
        };

        const handleUsersCount = (count) => {
            setActiveUsers(count || 0);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect_attempt', handleReconnecting);
        socket.on('users:count', handleUsersCount);

        // Set initial state
        setConnected(isSocketConnected());

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('reconnect_attempt', handleReconnecting);
            socket.off('users:count', handleUsersCount);
        };
    }, []);

    return { connected, activeUsers, reconnecting };
};

