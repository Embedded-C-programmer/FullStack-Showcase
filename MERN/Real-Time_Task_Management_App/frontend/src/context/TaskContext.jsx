import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useSocket } from '../hooks/useSocket';

const TaskContext = createContext();

export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within TaskProvider');
    }
    return context;
};

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [optimisticUpdates, setOptimisticUpdates] = useState(new Set());

    const socket = useSocket();

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleTaskCreated = (task) => {
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                // Check if task already exists (by _id)
                if (validTasks.some(t => t._id === task._id)) {
                    console.log('Task already exists, skipping:', task._id);
                    return validTasks;
                }
                console.log('Adding task from socket:', task._id);
                return [...validTasks, task];
            });
            // Remove from optimistic updates
            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(task._id);
                return next;
            });
        };

        const handleTaskUpdated = (updatedTask) => {
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return validTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
            });
            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(updatedTask._id);
                return next;
            });
        };

        const handleTaskDeleted = (taskId) => {
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return validTasks.filter(t => t._id !== taskId);
            });
            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        };

        const handleTasksSync = (syncedTasks) => {
            setTasks(Array.isArray(syncedTasks) ? syncedTasks : []);
            setOptimisticUpdates(new Set());
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:deleted', handleTaskDeleted);
        socket.on('tasks:sync', handleTasksSync);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('task:deleted', handleTaskDeleted);
            socket.off('tasks:sync', handleTasksSync);
        };
    }, [socket]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTasks();

            let tasksData = [];
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    tasksData = response;
                } else if (response.data && Array.isArray(response.data)) {
                    tasksData = response.data;
                } else if (response.tasks && Array.isArray(response.tasks)) {
                    tasksData = response.tasks;
                }
            }

            setTasks(tasksData);
            setOptimisticUpdates(new Set());
        } catch (err) {
            console.error('Error loading tasks:', err);
            setError('Failed to load tasks. Please try again.');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = useCallback(async (title) => {
        if (!title || typeof title !== 'string' || !title.trim()) {
            throw new Error('Task title is required');
        }

        const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const optimisticTask = {
            _id: tempId,
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            assignedTo: null,
            assignedBy: null,
            completedBy: null,
            createdBy: localStorage.getItem('userEmail') || 'anonymous'
        };

        // Add to optimistic updates set
        setOptimisticUpdates(prev => new Set(prev).add(tempId));

        // IMMEDIATELY add to tasks
        setTasks(prev => {
            const validTasks = Array.isArray(prev) ? prev : [];
            return [...validTasks, optimisticTask];
        });

        try {
            const response = await createTask({ title: title.trim() });
            const newTask = response.data || response;

            console.log('Task created successfully:', newTask._id);

            // Replace temp task with real task
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                // Remove temp and add real (avoid duplicates)
                const filtered = validTasks.filter(t => t._id !== tempId && t._id !== newTask._id);
                return [...filtered, newTask];
            });

            // Remove from optimistic updates
            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(tempId);
                next.delete(newTask._id);
                return next;
            });

            // DON'T emit to socket - backend does this
            // The socket will broadcast to OTHER users, not back to us

            return newTask;
        } catch (err) {
            console.error('Error creating task:', err);

            // Remove optimistic task on error
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return validTasks.filter(t => t._id !== tempId);
            });

            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(tempId);
                return next;
            });

            setError('Failed to create task');
            throw err;
        }
    }, [socket]);

    const handleUpdateTask = useCallback(async (id, updates) => {
        const validTasks = Array.isArray(tasks) ? tasks : [];
        const originalTask = validTasks.find(t => t._id === id);

        if (!originalTask) {
            throw new Error('Task not found');
        }

        setOptimisticUpdates(prev => new Set(prev).add(id));

        // IMMEDIATELY update in UI
        setTasks(prev => {
            const validTasks = Array.isArray(prev) ? prev : [];
            return validTasks.map(t => t._id === id ? { ...t, ...updates } : t);
        });

        try {
            const response = await updateTask(id, updates);
            const updatedTask = response.data || response;

            // Update with server response
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return validTasks.map(t => t._id === id ? updatedTask : t);
            });

            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });

            return updatedTask;
        } catch (err) {
            console.error('Error updating task:', err);

            // Rollback on error
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return validTasks.map(t => t._id === id ? originalTask : t);
            });

            setOptimisticUpdates(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });

            setError('Failed to update task');
            throw err;
        }
    }, [tasks, socket]);

    const handleDeleteTask = useCallback(async (id) => {
        const validTasks = Array.isArray(tasks) ? tasks : [];
        const originalTask = validTasks.find(t => t._id === id);

        if (!originalTask) {
            throw new Error('Task not found');
        }

        // IMMEDIATELY remove from UI
        setTasks(prev => {
            const validTasks = Array.isArray(prev) ? prev : [];
            return validTasks.filter(t => t._id !== id);
        });

        try {
            await deleteTask(id);
        } catch (err) {
            console.error('Error deleting task:', err);

            // Restore on error
            setTasks(prev => {
                const validTasks = Array.isArray(prev) ? prev : [];
                return [...validTasks, originalTask].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            });

            setError('Failed to delete task');
            throw err;
        }
    }, [tasks, socket]);

    // Ensure tasks is always an array before filtering
    const validTasks = Array.isArray(tasks) ? tasks : [];

    const filteredTasks = validTasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    // CORRECT stats calculation
    const stats = {
        total: validTasks.length,
        completed: validTasks.filter(t => t.completed === true).length,
        active: validTasks.filter(t => t.completed === false).length,
    };

    const value = {
        tasks: filteredTasks,
        allTasks: validTasks,
        stats,
        filter,
        setFilter,
        loading,
        error,
        setError,
        optimisticUpdates,
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        deleteTask: handleDeleteTask,
        refreshTasks: loadTasks,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
