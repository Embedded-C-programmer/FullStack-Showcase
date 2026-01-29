import React, { useState } from 'react';
import { CheckCircle, Circle, Trash2, Clock, Star, UserPlus, User } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import UserAvatar from '../UserAvatar/UserAvatar';
import './TaskItem.css';

const TaskItem = ({ task, index }) => {
    const { updateTask, deleteTask, optimisticUpdates } = useTask();
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const isOptimistic = optimisticUpdates.has(task._id);

    const handleToggle = async () => {
        try {
            const updates = {
                completed: !task.completed,
                completedBy: !task.completed ? user?.email : null
            };
            await updateTask(task._id, updates);
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const handleAssign = async () => {
        try {
            const isAssigned = task.assignedTo === user?.email;
            const updates = {
                assignedTo: isAssigned ? null : user?.email,
                assignedBy: isAssigned ? null : user?.email
            };
            await updateTask(task._id, updates);
        } catch (error) {
            console.error('Failed to assign task:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setIsDeleting(true);
            try {
                await deleteTask(task._id);
            } catch (error) {
                console.error('Failed to delete task:', error);
                setIsDeleting(false);
            }
        }
    };

    const isAssignedToMe = task.assignedTo === user?.email;
    const canAssign = user && !task.completed;

    return (
        <div
            className={`task-item ${isOptimistic ? 'optimistic' : ''} ${isDeleting ? 'deleting' : ''} ${task.completed ? 'completed' : ''}`}
            style={{
                animationDelay: `${index * 0.05}s`,
            }}
        >
            <button
                className="task-toggle"
                onClick={handleToggle}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                disabled={isOptimistic}
            >
                {task.completed ? (
                    <CheckCircle className="icon-completed" size={24} />
                ) : (
                    <Circle className="icon-incomplete" size={24} />
                )}
            </button>

            <div className="task-content">
                <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                    {task._id.startsWith('temp_') && (
                        <span className="syncing-badge">Syncing...</span>
                    )}
                </h3>

                <div className="task-meta">
                    <Clock size={14} />
                    <span>{formatDate(task.createdAt)}</span>

                    {task.priority && (
                        <span className={`priority-badge priority-${task.priority}`}>
                            <Star size={12} />
                            {task.priority}
                        </span>
                    )}
                </div>

                <div className="task-meta-extended">
                    {/* Created By */}
                    {task.createdBy && (
                        <div className="task-assignment-info">
                            <span className="info-label">Created by:</span>
                            <UserAvatar email={task.createdBy} size="small" showStatus={false} />
                            <span className="user-email">{task.createdBy}</span>
                        </div>
                    )}

                    {/* Assignment Status */}
                    <div className="task-assignment-info">
                        {task.assignedTo ? (
                            <>
                                {task.completed ? (
                                    <>
                                        <span className="task-status-badge completed">
                                            ✓ Completed by
                                        </span>
                                        <UserAvatar email={task.completedBy || task.assignedTo} size="small" />
                                        <span className="user-email">{task.completedBy || task.assignedTo}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="task-status-badge pending">
                                            ⏳ Pending by
                                        </span>
                                        <UserAvatar email={task.assignedTo} size="small" showStatus={true} />
                                        <span className="user-email">{task.assignedTo}</span>
                                    </>
                                )}
                            </>
                        ) : (
                            canAssign && (
                                <button className="assign-button" onClick={handleAssign}>
                                    <UserPlus size={14} />
                                    Assign to me
                                </button>
                            )
                        )}

                        {/* Unassign button if assigned to me */}
                        {isAssignedToMe && !task.completed && (
                            <button
                                className="assign-button assigned"
                                onClick={handleAssign}
                                title="Click to unassign"
                            >
                                <User size={14} />
                                Assigned to you
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <button
                className="task-delete"
                onClick={handleDelete}
                aria-label="Delete task"
                disabled={isDeleting}
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
};

export default TaskItem;

