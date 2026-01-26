import React, { useState, useRef, useEffect } from 'react';

function DraggableThemeToggle({ theme, onToggle }) {
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    useEffect(() => {
        // Load saved position
        const savedPos = localStorage.getItem('themeTogglePosition');
        if (savedPos) {
            setPosition(JSON.parse(savedPos));
        }
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Keep within bounds
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;

        const boundedX = Math.max(10, Math.min(newX, maxX));
        const boundedY = Math.max(10, Math.min(newY, maxY));

        setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            // Save position
            localStorage.setItem('themeTogglePosition', JSON.stringify(position));
        }
    };

    const handleClick = (e) => {
        // Only toggle if not dragging
        if (!isDragging) {
            onToggle();
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    return (
        <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c5ce7, #5f4fd1)',
                border: 'none',
                color: 'white',
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                transition: isDragging ? 'none' : 'all 0.25s ease',
                zIndex: 9999,
                userSelect: 'none'
            }}
            title="Drag to move, Click to toggle theme"
        >
            <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ width: '28px', height: '28px', pointerEvents: 'none' }}
            >
                {theme === 'dark' ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                )}
            </svg>
        </button>
    );
}

export default DraggableThemeToggle;