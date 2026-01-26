import React, { useState } from 'react';
import * as postService from '../services/postService';
import './PostEditor.css';

const PostEditor = ({ post, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: post?.title || '',
        excerpt: post?.excerpt || '',
        content: post?.content || ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }

        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'Excerpt is required';
        } else if (formData.excerpt.length < 10) {
            newErrors.excerpt = 'Excerpt must be at least 10 characters';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        } else if (formData.content.length < 50) {
            newErrors.content = 'Content must be at least 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            if (post) {
                await postService.updatePost(post.id, formData.title, formData.content, formData.excerpt);
            } else {
                await postService.createPost(formData.title, formData.content, formData.excerpt);
            }
            onSave();
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const getCharCount = (field) => {
        return formData[field].length;
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <div className="editor-title-section">
                    <h2 className="editor-main-title">
                        <span className="editor-icon">{post ? '✏️' : '✍️'}</span>
                        {post ? 'Edit Your Post' : 'Create New Post'}
                    </h2>
                    <p className="editor-subtitle">
                        {post ? 'Update your story and share it with the world' : 'Share your thoughts with the world'}
                    </p>
                </div>
                <button className="btn-cancel" onClick={onCancel}>
                    <span className="btn-cancel-icon">✕</span> Cancel
                </button>
            </div>

            {errors.submit && (
                <div className="error-alert">
                    <span className="error-alert-icon">⚠️</span>
                    <span>{errors.submit}</span>
                </div>
            )}

            <div className="editor-form">
                <div className="form-group">
                    <label className="form-label">
                        <span className="label-text">Title</span>
                        <span className="label-required">*</span>
                        <span className="char-count">{getCharCount('title')} chars</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.title ? 'input-error' : ''}`}
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter an engaging title..."
                        required
                    />
                    {errors.title && (
                        <span className="error-message">
                            <span className="error-icon">⚠️</span> {errors.title}
                        </span>
                    )}
                    <p className="input-hint">
                        💡 A good title is clear, concise, and captures attention
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <span className="label-text">Excerpt</span>
                        <span className="label-required">*</span>
                        <span className="char-count">{getCharCount('excerpt')}/300 chars</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.excerpt ? 'input-error' : ''}`}
                        value={formData.excerpt}
                        onChange={(e) => handleChange('excerpt', e.target.value)}
                        placeholder="Brief description of your post..."
                        required
                        maxLength={300}
                    />
                    {errors.excerpt && (
                        <span className="error-message">
                            <span className="error-icon">⚠️</span> {errors.excerpt}
                        </span>
                    )}
                    <p className="input-hint">
                        📝 A compelling excerpt encourages readers to click and read more
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <span className="label-text">Content</span>
                        <span className="label-required">*</span>
                        <span className="char-count">{getCharCount('content')} chars</span>
                    </label>
                    <textarea
                        className={`form-textarea ${errors.content ? 'input-error' : ''}`}
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="Write your story... Share your experiences, insights, and ideas."
                        rows="18"
                        required
                    />
                    {errors.content && (
                        <span className="error-message">
                            <span className="error-icon">⚠️</span> {errors.content}
                        </span>
                    )}
                    <p className="input-hint">
                        🎨 Use paragraphs to organize your thoughts and make it easier to read
                    </p>
                </div>

                <div className="editor-actions">
                    <button
                        onClick={handleSubmit}
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-small"></span>
                                <span>{post ? 'Updating...' : 'Publishing...'}</span>
                            </>
                        ) : (
                            <>
                                <span className="btn-submit-icon">{post ? '💾' : '🚀'}</span>
                                <span>{post ? 'Update Post' : 'Publish Post'}</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        className="btn-cancel-secondary"
                        disabled={loading}
                    >
                        <span className="btn-cancel-icon">↩️</span> Discard Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;