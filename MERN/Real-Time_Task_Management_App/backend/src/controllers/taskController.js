// const Task = require('../models/Task');
// const { getIO } = require('../config/socket');
// const logger = require('../utils/logger');

// // @desc    Get all tasks
// // @route   GET /api/tasks
// // @access  Public
// exports.getAllTasks = async (req, res, next) => {
//     try {
//         const {
//             completed,
//             priority,
//             search,
//             sort = '-createdAt',
//             limit,
//             page = 1,
//             assignedTo,
//             createdBy
//         } = req.query;

//         let query = {};

//         // Filters
//         if (completed !== undefined) {
//             query.completed = completed === 'true';
//         }

//         if (priority && ['low', 'medium', 'high'].includes(priority)) {
//             query.priority = priority;
//         }

//         if (assignedTo) {
//             query.assignedTo = assignedTo;
//         }

//         if (createdBy) {
//             query.createdBy = createdBy;
//         }

//         if (search && search.trim()) {
//             query.$or = [
//                 { title: { $regex: search.trim(), $options: 'i' } },
//                 { description: { $regex: search.trim(), $options: 'i' } }
//             ];
//         }

//         // Pagination
//         const pageSize = Math.min(parseInt(limit) || 100, 1000);
//         const skip = (parseInt(page) - 1) * pageSize;

//         // Execute query
//         const [tasks, total] = await Promise.all([
//             Task.find(query)
//                 .sort(sort)
//                 .limit(pageSize)
//                 .skip(skip)
//                 .lean()
//                 .exec(),
//             Task.countDocuments(query)
//         ]);

//         logger.info(`Fetched ${tasks.length} tasks (page ${page})`);

//         res.status(200).json({
//             success: true,
//             count: tasks.length,
//             total,
//             page: parseInt(page),
//             pages: Math.ceil(total / pageSize),
//             data: tasks
//         });
//     } catch (error) {
//         logger.error('Error in getAllTasks:', error);
//         next(error);
//     }
// };

// // @desc    Create new task
// // @route   POST /api/tasks
// // @access  Public
// exports.createTask = async (req, res, next) => {
//     try {
//         const { title, description, priority, dueDate, tags, createdBy } = req.body;

//         if (!title || !title.trim()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Task title is required'
//             });
//         }

//         const taskData = {
//             title: title.trim(),
//             description: description?.trim(),
//             priority,
//             dueDate,
//             tags,
//             createdBy: createdBy || req.user?.email || 'anonymous'
//         };

//         const task = await Task.create(taskData);

//         // Emit socket event
//         try {
//             const io = getIO();
//             io.emit('task:created', task);
//             logger.info(`Task created and broadcasted: ${task._id} by ${task.createdBy}`);
//         } catch (socketError) {
//             logger.error('Socket emit error:', socketError);
//         }

//         res.status(201).json({
//             success: true,
//             data: task
//         });
//     } catch (error) {
//         logger.error('Error in createTask:', error);

//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: Object.values(error.errors).map(err => err.message)
//             });
//         }

//         next(error);
//     }
// };

// // @desc    Update task
// // @route   PATCH /api/tasks/:id
// // @access  Public
// exports.updateTask = async (req, res, next) => {
//     try {
//         const {
//             title,
//             description,
//             completed,
//             priority,
//             dueDate,
//             tags,
//             assignedTo,
//             assignedBy,
//             completedBy
//         } = req.body;

//         // Build update object
//         const updateData = {};
//         if (title !== undefined) updateData.title = title.trim();
//         if (description !== undefined) updateData.description = description?.trim();
//         if (completed !== undefined) {
//             updateData.completed = completed;
//             if (completed && completedBy) {
//                 updateData.completedBy = completedBy;
//             }
//         }
//         if (priority !== undefined) updateData.priority = priority;
//         if (dueDate !== undefined) updateData.dueDate = dueDate;
//         if (tags !== undefined) updateData.tags = tags;
//         if (assignedTo !== undefined) {
//             updateData.assignedTo = assignedTo;
//             if (assignedTo && assignedBy) {
//                 updateData.assignedBy = assignedBy;
//             }
//         }

//         const task = await Task.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!task) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Task not found'
//             });
//         }

//         // Emit socket event
//         try {
//             const io = getIO();
//             io.emit('task:updated', task);
//             logger.info(`Task updated and broadcasted: ${task._id}`);
//         } catch (socketError) {
//             logger.error('Socket emit error:', socketError);
//         }

//         res.status(200).json({
//             success: true,
//             data: task
//         });
//     } catch (error) {
//         logger.error('Error in updateTask:', error);
//         next(error);
//     }
// };

// // @desc    Get user-specific tasks
// // @route   GET /api/tasks/user/:email
// // @access  Public
// exports.getUserTasks = async (req, res, next) => {
//     try {
//         const { email } = req.params;
//         const tasks = await Task.getUserTasks(email);

//         res.status(200).json({
//             success: true,
//             count: tasks.length,
//             data: tasks
//         });
//     } catch (error) {
//         logger.error('Error in getUserTasks:', error);
//         next(error);
//     }
// };

// // @desc    Get task statistics with user breakdown
// // @route   GET /api/tasks/stats
// // @access  Public
// exports.getTaskStats = async (req, res, next) => {
//     try {
//         const stats = await Task.getStats();

//         res.status(200).json({
//             success: true,
//             data: stats
//         });
//     } catch (error) {
//         logger.error('Error in getTaskStats:', error);
//         next(error);
//     }
// };

// // Rest of the controller methods remain the same...
// exports.getTask = async (req, res, next) => {
//     try {
//         const task = await Task.findById(req.params.id).lean();

//         if (!task) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Task not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: task
//         });
//     } catch (error) {
//         logger.error('Error in getTask:', error);
//         next(error);
//     }
// };

// exports.deleteTask = async (req, res, next) => {
//     try {
//         const task = await Task.findByIdAndDelete(req.params.id);

//         if (!task) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Task not found'
//             });
//         }

//         try {
//             const io = getIO();
//             io.emit('task:deleted', req.params.id);
//             logger.info(`Task deleted and broadcasted: ${req.params.id}`);
//         } catch (socketError) {
//             logger.error('Socket emit error:', socketError);
//         }

//         res.status(200).json({
//             success: true,
//             data: {},
//             message: 'Task deleted successfully'
//         });
//     } catch (error) {
//         logger.error('Error in deleteTask:', error);
//         next(error);
//     }
// };

// exports.toggleTaskCompletion = async (req, res, next) => {
//     try {
//         const task = await Task.findById(req.params.id);

//         if (!task) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Task not found'
//             });
//         }

//         task.completed = !task.completed;
//         await task.save();

//         try {
//             const io = getIO();
//             io.emit('task:updated', task);
//             logger.info(`Task toggled and broadcasted: ${task._id}`);
//         } catch (socketError) {
//             logger.error('Socket emit error:', socketError);
//         }

//         res.status(200).json({
//             success: true,
//             data: task
//         });
//     } catch (error) {
//         logger.error('Error in toggleTaskCompletion:', error);
//         next(error);
//     }
// };


const Task = require('../models/Task');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, priority, dueDate, tags, createdBy } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        // ✅ GET USER EMAIL FROM REQUEST BODY OR AUTH
        const userEmail = createdBy || req.user?.email || 'anonymous';

        const taskData = {
            title: title.trim(),
            description: description?.trim(),
            priority,
            dueDate,
            tags,
            createdBy: userEmail  // ✅ SAVE USER EMAIL
        };

        console.log('Creating task with createdBy:', userEmail);

        const task = await Task.create(taskData);

        logger.info(`Task created: ${task._id} by ${task.createdBy}`);

        // Emit socket event
        try {
            const io = getIO();
            io.emit('task:created', task);
            logger.info(`Task broadcasted: ${task._id}`);
        } catch (socketError) {
            logger.error('Socket emit error:', socketError);
        }

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error in createTask:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        next(error);
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getAllTasks = async (req, res, next) => {
    try {
        const {
            completed,
            priority,
            search,
            sort = '-createdAt',
            limit,
            page = 1,
            assignedTo,
            createdBy
        } = req.query;

        let query = {};

        if (completed !== undefined) {
            query.completed = completed === 'true';
        }

        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }

        if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        if (createdBy) {
            query.createdBy = createdBy;
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const pageSize = Math.min(parseInt(limit) || 100, 1000);
        const skip = (parseInt(page) - 1) * pageSize;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .sort(sort)
                .limit(pageSize)
                .skip(skip)
                .lean()
                .exec(),
            Task.countDocuments(query)
        ]);

        logger.info(`Fetched ${tasks.length} tasks (page ${page})`);

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / pageSize),
            data: tasks
        });
    } catch (error) {
        logger.error('Error in getAllTasks:', error);
        next(error);
    }
};

// Keep all other controller methods the same...
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).lean();

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error in getTask:', error);
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const {
            title,
            description,
            completed,
            priority,
            dueDate,
            tags,
            assignedTo,
            assignedBy,
            completedBy
        } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (completed !== undefined) {
            updateData.completed = completed;
            if (completed && completedBy) {
                updateData.completedBy = completedBy;
            }
        }
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (tags !== undefined) updateData.tags = tags;
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo;
            if (assignedTo && assignedBy) {
                updateData.assignedBy = assignedBy;
            }
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        try {
            const io = getIO();
            io.emit('task:updated', task);
            logger.info(`Task updated and broadcasted: ${task._id}`);
        } catch (socketError) {
            logger.error('Socket emit error:', socketError);
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error in updateTask:', error);
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        try {
            const io = getIO();
            io.emit('task:deleted', req.params.id);
            logger.info(`Task deleted and broadcasted: ${req.params.id}`);
        } catch (socketError) {
            logger.error('Socket emit error:', socketError);
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Task deleted successfully'
        });
    } catch (error) {
        logger.error('Error in deleteTask:', error);
        next(error);
    }
};

exports.toggleTaskCompletion = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        task.completed = !task.completed;
        await task.save();

        try {
            const io = getIO();
            io.emit('task:updated', task);
            logger.info(`Task toggled and broadcasted: ${task._id}`);
        } catch (socketError) {
            logger.error('Socket emit error:', socketError);
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error in toggleTaskCompletion:', error);
        next(error);
    }
};

exports.getUserTasks = async (req, res, next) => {
    try {
        const { email } = req.params;
        const tasks = await Task.getUserTasks(email);

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        logger.error('Error in getUserTasks:', error);
        next(error);
    }
};

exports.getTaskStats = async (req, res, next) => {
    try {
        const stats = await Task.getStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error in getTaskStats:', error);
        next(error);
    }
};