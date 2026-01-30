// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { FiSun, FiMoon } from 'react-icons/fi';
// import '../styles/ThemeToggle.css';

// const ThemeToggle = () => {
//     const [isDark, setIsDark] = useState(true);
//     const [position, setPosition] = useState({ x: 20, y: 20 });

//     useEffect(() => {
//         // Load theme preference
//         const savedTheme = localStorage.getItem('theme') || 'dark';
//         const savedPosition = JSON.parse(localStorage.getItem('themeTogglePosition') || '{"x": 20, "y": 20}');

//         setIsDark(savedTheme === 'dark');
//         setPosition(savedPosition);
//         document.documentElement.setAttribute('data-theme', savedTheme);
//     }, []);

//     const toggleTheme = () => {
//         const newTheme = isDark ? 'light' : 'dark';
//         setIsDark(!isDark);
//         document.documentElement.setAttribute('data-theme', newTheme);
//         localStorage.setItem('theme', newTheme);
//     };

//     const handleDragEnd = (event, info) => {
//         const newPosition = {
//             x: Math.max(0, Math.min(window.innerWidth - 60, position.x + info.offset.x)),
//             y: Math.max(0, Math.min(window.innerHeight - 60, position.y + info.offset.y))
//         };
//         setPosition(newPosition);
//         localStorage.setItem('themeTogglePosition', JSON.stringify(newPosition));
//     };

//     return (
//         <motion.div
//             className="theme-toggle"
//             drag
//             dragMomentum={false}
//             dragElastic={0}
//             onDragEnd={handleDragEnd}
//             style={{
//                 position: 'fixed',
//                 left: position.x,
//                 top: position.y,
//                 zIndex: 9999
//             }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//         >
//             <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme (draggable)">
//                 {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
//             </button>
//         </motion.div>
//     );
// };

// export default ThemeToggle;


import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Load theme preference
        const savedTheme = localStorage.getItem('theme') || 'dark';

        setIsDark(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
    );
};

export default ThemeToggle;