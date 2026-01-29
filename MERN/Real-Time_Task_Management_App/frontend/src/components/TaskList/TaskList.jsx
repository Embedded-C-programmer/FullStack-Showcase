import React, { useEffect, useRef } from 'react';
import { Clock, RefreshCw, Inbox, CheckSquare } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import TaskItem from '../TaskItem/TaskItem';
import './TaskList.css';

const TaskList = () => {
    const { tasks, loading, error, refreshTasks, filter } = useTask();
    const listRef = useRef(null);
    const prevTasksLength = useRef(tasks.length);

    // Smooth scroll when new task is added
    useEffect(() => {
        if (tasks.length > prevTasksLength.current && listRef.current) {
            // Scroll to bottom when new task is added
            setTimeout(() => {
                listRef.current.scrollTo({
                    top: listRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
        prevTasksLength.current = tasks.length;
    }, [tasks.length]);

    if (loading) {
        return (
            <div className="task-list-container">
                <div className="loading-state">
                    <RefreshCw className="loading-icon" size={48} />
                    <p className="loading-text">Loading your tasks...</p>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="task-list-container">
                <div className="error-state">
                    <div className="error-icon-wrapper">
                        <span className="error-icon">⚠️</span>
                    </div>
                    <p className="error-message-display">{error}</p>
                    <button className="retry-button" onClick={refreshTasks}>
                        <RefreshCw size={18} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        const emptyMessages = {
            all: {
                icon: Inbox,
                title: 'No tasks yet',
                description: 'Create your first task above to get started!'
            },
            active: {
                icon: Clock,
                title: 'No active tasks',
                description: 'All tasks are completed! Time to celebrate 🎉'
            },
            completed: {
                icon: CheckSquare,
                title: 'No completed tasks',
                description: 'Complete some tasks to see them here'
            }
        };

        const message = emptyMessages[filter] || emptyMessages.all;
        const EmptyIcon = message.icon;

        return (
            <div className="task-list-container">
                <div className="empty-state">
                    <div className="empty-icon-wrapper">
                        <EmptyIcon className="empty-icon" size={72} />
                    </div>
                    <h3 className="empty-title">{message.title}</h3>
                    <p className="empty-description">{message.description}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="task-list-container">
            <div className="task-list-header">
                <div className="header-left">
                    <h2>
                        {filter === 'all' && '📋 All Tasks'}
                        {filter === 'active' && '⏳ Active Tasks'}
                        {filter === 'completed' && '✅ Completed Tasks'}
                    </h2>
                    <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
                </div>
                <button
                    className="refresh-button"
                    onClick={refreshTasks}
                    aria-label="Refresh tasks"
                    title="Refresh tasks"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="task-list" ref={listRef}>
                {tasks.map((task, index) => (
                    <TaskItem key={task._id} task={task} index={index} />
                ))}
            </div>
        </div>
    );
};

export default TaskList;

