import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import WelcomeScreen from '../components/WelcomeScreen';
import '../styles/Chat.css';

const Chat = () => {
    const { loadConversations, activeConversation } = useChat();

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return (
        <div className="chat-container">
            <Sidebar />
            {activeConversation ? <ChatArea /> : <WelcomeScreen />}
        </div>
    );
};

export default Chat;