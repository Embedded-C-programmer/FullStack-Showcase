import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const UserProfile = ({ onClose }) => {
    const { user, updateProfile } = useAuth();
    const [bio, setBio] = useState(user?.bio || '');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await updateProfile({ bio });
        setSaving(false);
        setEditing(false);
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal profile-modal user-profile-modal glass"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Profile</h2>
                    <button className="icon-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="profile-content">
                    <div className="profile-avatar-section">
                        <img src={user?.avatar} alt={user?.username} className="profile-avatar" />
                        <div className="status-indicator online"></div>
                    </div>

                    <div className="profile-info">
                        <h3>{user?.username}</h3>
                        <p className="profile-email">{user?.email}</p>
                    </div>

                    <div className="profile-bio-section">
                        <div className="section-header">
                            <label>Bio</label>
                            {!editing && (
                                <button
                                    className="edit-btn"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="bio-editor">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    maxLength={200}
                                    rows={4}
                                />
                                <div className="bio-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setBio(user?.bio || '');
                                            setEditing(false);
                                        }}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        className="btn-primary"
                                        onClick={handleSave}
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <p className="bio-text">
                                {user?.bio || 'No bio yet'}
                            </p>
                        )}
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-label">Member since</span>
                            <span className="stat-value">
                                {new Date(user?.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;