// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useChat } from '../context/ChatContext';
// import ConversationItem from './ConversationItem';
// import NewChatModal from './NewChatModal';
// import UserProfile from './UserProfile';
// import ThemeToggle from './ThemeToggle';
// import { motion, AnimatePresence } from 'framer-motion';

// const Sidebar = () => {
//     const { user, logout } = useAuth();
//     const { conversations, loading } = useChat();
//     const [showNewChat, setShowNewChat] = useState(false);
//     const [showProfile, setShowProfile] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filter, setFilter] = useState('all'); // 'all', 'unread', 'groups'

//     const filteredConversations = conversations.filter(conv => {
//         // Search filter
//         const name = conv.type === 'group'
//             ? conv.name
//             : conv.participants.find(p => p._id !== user._id)?.username || '';
//         const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

//         // Type filter
//         if (filter === 'groups') {
//             return matchesSearch && conv.type === 'group';
//         }

//         if (filter === 'unread') {
//             // Check if there are unread messages (you can implement unread count logic)
//             return matchesSearch && conv.unreadCount > 0;
//         }

//         return matchesSearch;
//     });

//     return (
//         <>
//             <div className="sidebar">
//                 <div className="sidebar-header glass">
//                     <div className="sidebar-header-top">
//                         <h2 className="sidebar-title gradient-text">ChatFlow</h2>
//                         <div className="sidebar-actions">
//                             <ThemeToggle />
//                             <motion.button
//                                 className="icon-btn"
//                                 onClick={() => setShowNewChat(true)}
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 title="New chat"
//                             >
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <path d="M12 5v14M5 12h14" />
//                                 </svg>
//                             </motion.button>
//                         </div>
//                     </div>

//                     <div className="search-bar">
//                         <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <circle cx="11" cy="11" r="8" />
//                             <path d="m21 21-4.35-4.35" />
//                         </svg>
//                         <input
//                             type="text"
//                             placeholder="Search conversations..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>

//                     <div className="conversation-filters">
//                         <button
//                             className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
//                             onClick={() => setFilter('all')}
//                         >
//                             All
//                         </button>
//                         <button
//                             className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
//                             onClick={() => setFilter('unread')}
//                         >
//                             Unread
//                         </button>
//                         <button
//                             className={`filter-btn ${filter === 'groups' ? 'active' : ''}`}
//                             onClick={() => setFilter('groups')}
//                         >
//                             Groups
//                         </button>
//                     </div>
//                 </div>

//                 <div className="conversations-list">
//                     {loading ? (
//                         <div className="loading-state">
//                             <div className="spinner large"></div>
//                             <p>Loading conversations...</p>
//                         </div>
//                     ) : filteredConversations.length === 0 ? (
//                         <div className="empty-state">
//                             <p>No conversations yet</p>
//                             <span>Start a new chat to get started</span>
//                         </div>
//                     ) : (
//                         <AnimatePresence>
//                             {filteredConversations.map((conversation, index) => (
//                                 <motion.div
//                                     key={conversation._id}
//                                     initial={{ opacity: 0, x: -20 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: -20 }}
//                                     transition={{ delay: index * 0.05 }}
//                                 >
//                                     <ConversationItem conversation={conversation} />
//                                 </motion.div>
//                             ))}
//                         </AnimatePresence>
//                     )}
//                 </div>

//                 <div className="sidebar-footer glass">
//                     <motion.div
//                         className="user-card"
//                         onClick={() => setShowProfile(true)}
//                         whileHover={{ scale: 1.02 }}
//                     >
//                         <img
//                             src={user?.avatar}
//                             alt={user?.username}
//                             className="user-avatar"
//                         />
//                         <div className="user-info">
//                             <div className="user-name">{user?.username}</div>
//                             <div className="user-status">
//                                 <span className="status-dot online"></span>
//                                 Online
//                             </div>
//                         </div>
//                     </motion.div>

//                     <motion.button
//                         className="icon-btn logout-btn"
//                         onClick={logout}
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         title="Logout"
//                     >
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//                             <polyline points="16 17 21 12 16 7" />
//                             <line x1="21" y1="12" x2="9" y2="12" />
//                         </svg>
//                     </motion.button>
//                 </div>
//             </div>

//             <AnimatePresence>
//                 {showNewChat && (
//                     <NewChatModal onClose={() => setShowNewChat(false)} />
//                 )}
//                 {showProfile && (
//                     <UserProfile onClose={() => setShowProfile(false)} />
//                 )}
//             </AnimatePresence>
//         </>
//     );
// };

// export default Sidebar;



import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ConversationItem from './ConversationItem';
import NewChatModal from './NewChatModal';
import UserProfile from './UserProfile';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Sidebar = ({ onClose }) => {
    const { user, logout } = useAuth();
    const { conversations, loading } = useChat();
    const [showNewChat, setShowNewChat] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'groups'

    const filteredConversations = conversations.filter(conv => {
        // Search filter
        const name = conv.type === 'group'
            ? conv.name
            : conv.participants.find(p => p._id !== user._id)?.username || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        // Type filter
        if (filter === 'groups') {
            return matchesSearch && conv.type === 'group';
        }

        if (filter === 'unread') {
            // Check if there are unread messages (you can implement unread count logic)
            return matchesSearch && conv.unreadCount > 0;
        }

        return matchesSearch;
    });

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header glass">
                    <div className="sidebar-header-top">
                        <h2 className="sidebar-title gradient-text">ChatFlow</h2>
                        <div className="sidebar-actions">
                            <ThemeToggle />
                            <motion.button
                                className="icon-btn"
                                onClick={() => setShowNewChat(true)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="New chat"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </motion.button>
                            {onClose && (
                                <motion.button
                                    className="icon-btn mobile-close-btn"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Close menu"
                                >
                                    <FiX size={20} />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className="search-bar">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="conversation-filters">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`filter-btn ${filter === 'groups' ? 'active' : ''}`}
                            onClick={() => setFilter('groups')}
                        >
                            Groups
                        </button>
                    </div>
                </div>

                <div className="conversations-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner large"></div>
                            <p>Loading conversations...</p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="empty-state">
                            <p>No conversations yet</p>
                            <span>Start a new chat to get started</span>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredConversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ConversationItem conversation={conversation} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="sidebar-footer glass">
                    <motion.div
                        className="user-card"
                        onClick={() => setShowProfile(true)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <img
                            src={user?.avatar}
                            alt={user?.username}
                            className="user-avatar"
                        />
                        <div className="user-info">
                            <div className="user-name">{user?.username}</div>
                            <div className="user-status">
                                <span className="status-dot online"></span>
                                Online
                            </div>
                        </div>
                    </motion.div>

                    <motion.button
                        className="icon-btn logout-btn"
                        onClick={logout}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Logout"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showNewChat && (
                    <NewChatModal onClose={() => setShowNewChat(false)} />
                )}
                {showProfile && (
                    <UserProfile onClose={() => setShowProfile(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;