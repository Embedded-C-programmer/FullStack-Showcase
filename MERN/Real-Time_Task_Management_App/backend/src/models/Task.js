const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // New fields for user assignment tracking
    createdBy: {
        type: String, // Email of creator
        trim: true
    },
    assignedTo: {
        type: String, // Email of assigned user
        trim: true
    },
    assignedBy: {
        type: String, // Email of who assigned
        trim: true
    },
    completedBy: {
        type: String, // Email of who completed
        trim: true
    },
    assignedAt: {
        type: Date
    },
    tags: [{
        type: String,
        trim: true
    }],
    completedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function () {
    return this.dueDate && !this.completed && new Date() > this.dueDate;
});

// Virtual for assignment status
taskSchema.virtual('assignmentStatus').get(function () {
    if (this.completed && this.completedBy) {
        return `Completed by ${this.completedBy}`;
    }
    if (this.assignedTo) {
        return `Assigned to ${this.assignedTo}`;
    }
    return 'Unassigned';
});

// Pre-save middleware
taskSchema.pre('save', function (next) {
    // Update completedAt when task is marked as completed
    if (this.isModified('completed') && this.completed) {
        this.completedAt = new Date();
    }

    // Clear completedAt when task is marked as incomplete
    if (this.isModified('completed') && !this.completed) {
        this.completedAt = undefined;
        this.completedBy = undefined;
    }

    // Update assignedAt when task is assigned
    if (this.isModified('assignedTo') && this.assignedTo) {
        this.assignedAt = new Date();
    }

    // Clear assignedAt when task is unassigned
    if (this.isModified('assignedTo') && !this.assignedTo) {
        this.assignedAt = undefined;
        this.assignedBy = undefined;
    }

    next();
});

// Static method to get task statistics
taskSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $facet: {
                total: [{ $count: 'count' }],
                completed: [
                    { $match: { completed: true } },
                    { $count: 'count' }
                ],
                active: [
                    { $match: { completed: false } },
                    { $count: 'count' }
                ],
                assigned: [
                    { $match: { assignedTo: { $ne: null } } },
                    { $count: 'count' }
                ],
                unassigned: [
                    { $match: { assignedTo: null } },
                    { $count: 'count' }
                ],
                byPriority: [
                    {
                        $group: {
                            _id: '$priority',
                            count: { $sum: 1 }
                        }
                    }
                ],
                byUser: [
                    {
                        $match: { assignedTo: { $ne: null } }
                    },
                    {
                        $group: {
                            _id: '$assignedTo',
                            count: { $sum: 1 },
                            completed: {
                                $sum: { $cond: ['$completed', 1, 0] }
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return {
        total: stats[0].total[0]?.count || 0,
        completed: stats[0].completed[0]?.count || 0,
        active: stats[0].active[0]?.count || 0,
        assigned: stats[0].assigned[0]?.count || 0,
        unassigned: stats[0].unassigned[0]?.count || 0,
        byPriority: stats[0].byPriority,
        byUser: stats[0].byUser
    };
};

// Static method to get user tasks
taskSchema.statics.getUserTasks = async function (email) {
    return await this.find({
        $or: [
            { createdBy: email },
            { assignedTo: email }
        ]
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Task', taskSchema);
