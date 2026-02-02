// import React, { useEffect, useState } from 'react';
// import { useChat } from '../context/ChatContext';
// import Sidebar from '../components/Sidebar';
// import ChatArea from '../components/ChatArea';
// import WelcomeScreen from '../components/WelcomeScreen';
// import { FiMenu } from 'react-icons/fi';
// import '../styles/Chat.css';

// const Chat = () => {
//     const { loadConversations, activeConversation } = useChat();
//     const [showSidebar, setShowSidebar] = useState(false);

//     useEffect(() => {
//         loadConversations();
//     }, [loadConversations]);

//     useEffect(() => {
//         // Close sidebar when conversation is selected on mobile
//         if (activeConversation && window.innerWidth < 768) {
//             setShowSidebar(false);
//         }
//     }, [activeConversation]);

//     return (
//         <>
//             <div className="chat-container">
//                 <div className={`sidebar ${showSidebar ? 'mobile-open' : ''}`}>
//                     <Sidebar />
//                 </div>
//                 {activeConversation ? <ChatArea /> : <WelcomeScreen />}
//             </div>

//             {/* Mobile Menu Toggle */}
//             {!showSidebar && (
//                 <button
//                     className="mobile-menu-toggle"
//                     onClick={() => setShowSidebar(true)}
//                     aria-label="Open menu"
//                 >
//                     <FiMenu size={24} />
//                 </button>
//             )}

//             {/* Sidebar Overlay for Mobile */}
//             <div
//                 className={`sidebar-overlay ${showSidebar ? 'active' : ''}`}
//                 onClick={() => setShowSidebar(false)}
//             />
//         </>
//     );
// };

// export default Chat;

import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import WelcomeScreen from '../components/WelcomeScreen';
import { FiMenu, FiArrowLeft } from 'react-icons/fi';
import '../styles/Chat.css';

const Chat = () => {
    const { loadConversations, activeConversation, selectConversation } = useChat();
    const [showSidebar, setShowSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // On mobile, show sidebar by default when no conversation is selected
        if (isMobile && !activeConversation) {
            setShowSidebar(true);
        }
    }, [isMobile, activeConversation]);

    useEffect(() => {
        // Lock body scroll when sidebar is open on mobile
        if (showSidebar && isMobile) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }

        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [showSidebar, isMobile]);

    const handleBackToSidebar = () => {
        selectConversation(null);
        setShowSidebar(true);
    };

    // Mobile view
    if (isMobile) {
        return (
            <div className="chat-container mobile">
                {!activeConversation ? (
                    // Show sidebar when no conversation selected
                    <div className="sidebar mobile-sidebar">
                        <Sidebar />
                    </div>
                ) : (
                    // Show chat area with back button when conversation selected
                    <div className="chat-area-mobile">
                        <ChatArea onBack={handleBackToSidebar} />
                    </div>
                )}
            </div>
        );
    }

    // Desktop view
    return (
        <>
            <div className="chat-container">
                <div className={`sidebar ${showSidebar ? 'mobile-open' : ''}`}>
                    <Sidebar onClose={() => setShowSidebar(false)} />
                </div>
                {activeConversation ? <ChatArea /> : <WelcomeScreen />}
            </div>

            {/* Mobile Menu Toggle - only show on desktop when sidebar is hidden */}
            {!isMobile && !showSidebar && (
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setShowSidebar(true)}
                    aria-label="Open menu"
                >
                    <FiMenu size={24} />
                </button>
            )}

            {/* Sidebar Overlay for Desktop */}
            <div
                className={`sidebar-overlay ${showSidebar ? 'active' : ''}`}
                onClick={() => setShowSidebar(false)}
            />
        </>
    );
};

export default Chat;