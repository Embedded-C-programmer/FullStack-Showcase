import React from 'react';
import { motion } from 'framer-motion';

const WelcomeScreen = () => {
    return (
        <div className="welcome-screen">
            <motion.div
                className="welcome-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="welcome-icon"
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                >
                    💬
                </motion.div>
                <h1 className="welcome-title gradient-text">Welcome to ChatFlow</h1>
                <p className="welcome-subtitle">
                    Select a conversation from the sidebar or start a new chat to begin messaging
                </p>

                <div className="welcome-features">
                    <div className="feature-item">
                        <span className="feature-icon">⚡</span>
                        <span>Real-time messaging</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">👥</span>
                        <span>Group conversations</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>Secure & private</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;