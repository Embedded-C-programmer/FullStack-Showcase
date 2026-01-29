import React, { useState } from 'react';
import { Plus, Loader, Sparkles } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import './TaskForm.css';

const TaskForm = () => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [focused, setFocused] = useState(false);
    const { createTask } = useTask();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setLocalError('Task title cannot be empty');
            return;
        }

        if (trimmedTitle.length > 200) {
            setLocalError('Task title cannot exceed 200 characters');
            return;
        }

        setLoading(true);
        setLocalError('');

        try {
            await createTask(trimmedTitle);
            setTitle('');

            // Success animation
            const form = document.querySelector('.task-form-wrapper');
            form.classList.add('success-pulse');
            setTimeout(() => form.classList.remove('success-pulse'), 600);
        } catch (error) {
            console.error('Error creating task:', error);
            setLocalError(error.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setTitle(e.target.value);
        if (localError) setLocalError('');
    };

    return (
        <div className="task-form-section">
            <div className="section-header">
                <Sparkles size={20} className="section-icon" />
                <h2 className="section-title">Create New Task</h2>
                <p className="section-subtitle">Add a task and watch it sync in real-time across all devices</p>
            </div>

            <div className={`task-form-wrapper ${focused ? 'focused' : ''}`}>
                <form className="task-form" onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={title}
                            onChange={handleInputChange}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="What needs to be done?"
                            className={`task-input ${localError ? 'error' : ''}`}
                            disabled={loading}
                            maxLength={200}
                            aria-label="Task title"
                            autoComplete="off"
                        />
                        {title.length > 0 && (
                            <span className={`char-count ${title.length > 180 ? 'warning' : ''}`}>
                                {title.length}/200
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="task-submit"
                        disabled={loading || !title.trim()}
                        aria-label="Add task"
                    >
                        {loading ? (
                            <>
                                <Loader className="spinner" size={20} />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                <span>Add Task</span>
                            </>
                        )}
                    </button>
                </form>
                {localError && (
                    <div className="error-message slide-down" role="alert">
                        <span className="error-icon">⚠️</span>
                        {localError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskForm;
