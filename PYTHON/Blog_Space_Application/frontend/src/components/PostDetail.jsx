import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as postService from '../services/postService';
import './PostDetail.css';

const PostDetail = ({ postId, onBack, onEdit }) => {
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        loadPost();
        loadComments();
    }, [postId]);

    const loadPost = async () => {
        try {
            const data = await postService.getPost(postId);
            setPost(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const data = await postService.getComments(postId);
            setComments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await postService.deletePost(postId);
            onBack();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            await postService.createComment(postId, commentText);
            setCommentText('');
            loadComments();
        } catch (err) {
            alert(err.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await postService.deleteComment(commentId);
            loadComments();
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Post not found</h2>
                <button className="btn-back" onClick={onBack}>← Go back</button>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <button className="btn-back" onClick={onBack}>
                <span className="back-icon">←</span> Back to posts
            </button>

            <article className="post-detail">
                {post.featured_image && (
                    <div className="post-featured-image">
                        <img src={post.featured_image} alt={post.title} />
                    </div>
                )}

                <header className="post-header">
                    <h1 className="post-title">{post.title}</h1>

                    <div className="post-meta">
                        <div className="author-info-large">
                            <div className="author-avatar-large" style={{
                                background: `linear-gradient(135deg, ${getAvatarColor(post.author?.username)} 0%, ${getAvatarColor(post.author?.username, true)} 100%)`
                            }}>
                                {getInitials(post.author?.username)}
                            </div>
                            <div className="author-details-large">
                                <div className="author-name-large">{post.author?.username}</div>
                                <div className="post-date-large">
                                    <span className="date-icon">📅</span> {formatDate(post.created_at)}
                                </div>
                                {post.created_at !== post.updated_at && (
                                    <div className="post-updated">
                                        <span className="update-icon">✏️</span> Updated {formatDate(post.updated_at)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {user && user.id === post.author?.id && (
                            <div className="post-actions">
                                <button className="btn-edit" onClick={() => onEdit(post)}>
                                    <span className="btn-icon">✏️</span> Edit
                                </button>
                                <button className="btn-delete" onClick={handleDelete}>
                                    <span className="btn-icon">🗑️</span> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="post-excerpt-detail">{post.excerpt}</div>
                <div className="divider"></div>
                <div className="post-content">{post.content}</div>

                <div className="post-footer">
                    <div className="post-stats">
                        <span className="stat-item">
                            <span className="stat-icon">💬</span> {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                    </div>
                </div>
            </article>

            <section className="comments-section">
                <h2 className="comments-title">
                    <span className="comments-icon">💬</span> Discussion ({comments.length})
                </h2>

                {user ? (
                    <div className="comment-form">
                        <div className="comment-form-header">
                            <div className="commenter-avatar" style={{
                                background: `linear-gradient(135deg, ${getAvatarColor(user.username)} 0%, ${getAvatarColor(user.username, true)} 100%)`
                            }}>
                                {getInitials(user.username)}
                            </div>
                            <span className="commenter-name">Comment as {user.username}</span>
                        </div>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows="4"
                            required
                        />
                        <button
                            onClick={handleCommentSubmit}
                            className="btn-primary"
                            disabled={commentLoading || !commentText.trim()}
                        >
                            {commentLoading ? '💭 Posting...' : '💬 Post Comment'}
                        </button>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <span className="prompt-icon">🔒</span>
                        <p>Please sign in to join the discussion</p>
                    </div>
                )}

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <div className="no-comments">
                            <div className="no-comments-icon">💭</div>
                            <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <div className="author-info">
                                        <div className="author-avatar-small" style={{
                                            background: `linear-gradient(135deg, ${getAvatarColor(comment.author?.username)} 0%, ${getAvatarColor(comment.author?.username, true)} 100%)`
                                        }}>
                                            {getInitials(comment.author?.username)}
                                        </div>
                                        <div className="comment-meta">
                                            <span className="comment-author">{comment.author?.username}</span>
                                            <span className="comment-date">
                                                <span className="time-icon">🕐</span> {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {user && user.id === comment.author?.id && (
                                        <button
                                            className="btn-delete-small"
                                            onClick={() => handleCommentDelete(comment.id)}
                                            title="Delete comment"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                <p className="comment-content">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

// Helper function to generate consistent colors for avatars
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

export default PostDetail;