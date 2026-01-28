import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import socketService from '../services/socket';
import { motion } from 'framer-motion';

const MessageInput = () => {
    const { activeConversation, sendMessage } = useChat();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Reset textarea height when conversation changes
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setMessage('');
    }, [activeConversation?._id]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.startTyping(activeConversation._id);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.stopTyping(activeConversation._id);
        }, 1000);
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
        handleTyping();

        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        sendMessage(activeConversation._id, message.trim());
        setMessage('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            socketService.stopTyping(activeConversation._id);
        }

        // Clear timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="message-input glass" onSubmit={handleSubmit}>
            <button
                type="button"
                className="icon-btn"
                title="Attach file"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
            </button>

            <button
                type="button"
                className="icon-btn"
                title="Emoji"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
            </button>

            <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="message-textarea"
            />

            <motion.button
                type="submit"
                className="send-btn"
                disabled={!message.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </motion.button>
        </form>
    );
};

export default MessageInput;