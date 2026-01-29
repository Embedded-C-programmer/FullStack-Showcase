import React from 'react';

const UserAvatar = ({ email, size = 'medium', showStatus = false, isOnline = true }) => {
    if (!email) return null;

    // Generate initials from email
    const getInitials = (email) => {
        const name = email.split('@')[0];
        return name.substring(0, 2).toUpperCase();
    };

    // Generate consistent color based on email
    const getColorClass = (email) => {
        const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return `avatar-color-${(hash % 8) + 1}`;
    };

    const sizeClass = size === 'small' ? 'user-avatar-small' : size === 'large' ? 'user-avatar-large' : '';

    return (
        <div className={`user-avatar ${sizeClass} ${getColorClass(email)}`} title={email}>
            {getInitials(email)}
            {showStatus && (
                <div className={`avatar-status ${isOnline ? 'online' : 'offline'}`} />
            )}
        </div>
    );
};

export default UserAvatar;
