import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import WelcomeScreen from '../components/WelcomeScreen';
import { FiMenu } from 'react-icons/fi';
import '../styles/Chat.css';

const Chat = () => {
    const { loadConversations, activeConversation } = useChat();
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        // Close sidebar when conversation is selected on mobile
        if (activeConversation && window.innerWidth < 768) {
            setShowSidebar(false);
        }
    }, [activeConversation]);

    return (
        <>
            <div className="chat-container">
                <div className={`sidebar ${showSidebar ? 'mobile-open' : ''}`}>
                    <Sidebar />
                </div>
                {activeConversation ? <ChatArea /> : <WelcomeScreen />}
            </div>

            {/* Mobile Menu Toggle */}
            {!showSidebar && (
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setShowSidebar(true)}
                    aria-label="Open menu"
                >
                    <FiMenu size={24} />
                </button>
            )}

            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${showSidebar ? 'active' : ''}`}
                onClick={() => setShowSidebar(false)}
            />
        </>
    );
};

export default Chat;