import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as postService from '../services/postService';
import './PostList.css';

const PostList = ({ onSelectPost, onNavigate }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await postService.getPosts();
            setPosts(data);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const getAvatarColor = (str, dark = false) => {
        if (!str) return dark ? '#764ba2' : '#667eea';

        const colors = [
            { light: '#667eea', dark: '#764ba2' },
            { light: '#f093fb', dark: '#f5576c' },
            { light: '#4facfe', dark: '#00f2fe' },
            { light: '#43e97b', dark: '#38f9d7' },
            { light: '#fa709a', dark: '#fee140' },
            { light: '#30cfd0', dark: '#330867' },
            { light: '#a8edea', dark: '#fed6e3' },
            { light: '#ff9a9e', dark: '#fecfef' },
        ];

        const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorPair = colors[hash % colors.length];
        return dark ? colorPair.dark : colorPair.light;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading amazing stories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button className="btn-retry" onClick={loadPosts}>
                    🔄 Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="post-list-container">
            <div className="hero">
                <div className="hero-background">
                    <div className="hero-circle hero-circle-1"></div>
                    <div className="hero-circle hero-circle-2"></div>
                    <div className="hero-circle hero-circle-3"></div>
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-title-gradient">Discover Stories</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore brilliant ideas from writers around the world
                    </p>
                    {user ? (
                        <button className="btn-hero" onClick={() => onNavigate('create')}>
                            <span className="btn-hero-icon">✍️</span>
                            Start Writing Your Story
                        </button>
                    ) : (
                        <button className="btn-hero" onClick={() => onNavigate('login')}>
                            <span className="btn-hero-icon">🚀</span>
                            Join Our Community
                        </button>
                    )}
                </div>
            </div>

            <div className="posts-section">
                <div className="posts-header">
                    <h2 className="posts-heading">
                        <span className="posts-heading-icon">📚</span>
                        Latest Stories
                    </h2>
                    <p className="posts-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
                </div>

                <div className="posts-grid">
                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <h3>No posts yet</h3>
                            <p>Be the first to share your story with the world!</p>
                            {user && (
                                <button className="btn-create" onClick={() => onNavigate('create')}>
                                    Create First Post
                                </button>
                            )}
                        </div>
                    ) : (
                        posts.map(post => (
                            <article
                                key={post.id}
                                className="post-card"
                                onClick={() => onSelectPost(post.id)}
                            >
                                {post.featured_image && (
                                    <div className="post-card-image">
                                        <img src={post.featured_image} alt={post.title} />
                                        <div className="post-card-overlay"></div>
                                    </div>
                                )}

                                <div className="post-card-content">
                                    <div className="post-card-header">
                                        <div className="author-info">
                                            <div
                                                className="author-avatar"
                                                style={{
                                                    background: `linear-gradient(135deg, ${getAvatarColor(post.author?.username)} 0%, ${getAvatarColor(post.author?.username, true)} 100%)`
                                                }}
                                            >
                                                {getInitials(post.author?.username)}
                                            </div>
                                            <div className="author-details">
                                                <span className="author-name">{post.author?.username}</span>
                                                <span className="post-date">
                                                    <span className="date-icon">📅</span>
                                                    {formatDate(post.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="post-card-title">{post.title}</h3>
                                    <p className="post-card-excerpt">{post.excerpt}</p>

                                    <div className="post-card-footer">
                                        <div className="post-card-stats">
                                            <span className="stat-item">
                                                <span className="stat-icon">💬</span>
                                                {post.comment_count || 0}
                                            </span>
                                        </div>
                                        <span className="read-more">
                                            Read more <span className="arrow">→</span>
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostList;