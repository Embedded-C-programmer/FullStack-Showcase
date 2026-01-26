import React, { useState, useEffect, useRef } from 'react';

function ProfileModal({ onClose }) {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [avatar, setAvatar] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setFormData({ username: parsed.username, email: parsed.email });
            setAvatar(`https://ui-avatars.com/api/?name=${parsed.username}&size=128&background=random`);
        }
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async () => {
        // Placeholder for profile update
        alert('Profile update feature coming soon!');
        setEditing(false);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <img
                            src={avatar}
                            alt="Profile"
                            style={{
                                width: '128px',
                                height: '128px',
                                borderRadius: '50%',
                                border: '4px solid var(--primary-color)',
                                marginBottom: '1rem',
                                objectFit: 'cover'
                            }}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change Avatar
                        </button>
                    </div>

                    {editing ? (
                        <div>
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Username</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user?.username}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{user?.email}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Member Since</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>January 2026</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {editing ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;