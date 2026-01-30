const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    type: {
        type: String,
        enum: ['audio', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'ringing', 'ongoing', 'ended', 'missed', 'rejected', 'failed'],
        default: 'initiated'
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    roomId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

// Calculate duration when call ends
// callSchema.pre('save', function (next) {
//     if (this.status === 'ended' && this.startedAt && this.endedAt) {
//         this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
//     }
//     next();
// });

callSchema.pre('save', function () {
    if (this.status === 'ended' && this.startedAt && this.endedAt) {
        this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
    }
});

module.exports = mongoose.model('Call', callSchema);