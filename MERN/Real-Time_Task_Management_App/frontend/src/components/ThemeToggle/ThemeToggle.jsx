import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('themeTogglePosition');
        return saved ? JSON.parse(saved) : { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        localStorage.setItem('themeTogglePosition', JSON.stringify(position));
    }, [position]);

    const handleMouseDown = (e) => {
        if (e.target.closest('.theme-toggle-button')) {
            const rect = dragRef.current.getBoundingClientRect();
            offsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            setIsDragging(true);
        }
    };

    const handleTouchStart = (e) => {
        if (e.target.closest('.theme-toggle-button')) {
            const touch = e.touches[0];
            const rect = dragRef.current.getBoundingClientRect();
            offsetRef.current = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
            setIsDragging(true);
        }
    };

    useEffect(() => {
        const handleMove = (clientX, clientY) => {
            if (isDragging) {
                const newX = Math.max(0, Math.min(window.innerWidth - 64, clientX - offsetRef.current.x));
                const newY = Math.max(0, Math.min(window.innerHeight - 64, clientY - offsetRef.current.y));
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };

        const handleEnd = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchend', handleEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchend', handleEnd);
            };
        }
    }, [isDragging]);

    const handleClick = (e) => {
        // Only toggle if not dragging (detect if mouse moved during drag)
        if (!isDragging) {
            toggleTheme();
        }
    };

    return (
        <div
            ref={dragRef}
            className="theme-toggle-wrapper"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <button
                className={`theme-toggle-button ${isDragging ? 'dragging' : ''}`}
                onClick={handleClick}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <Sun size={28} className="theme-icon" />
                ) : (
                    <Moon size={28} className="theme-icon" />
                )}
            </button>
        </div>
    );
};

export default ThemeToggle;
