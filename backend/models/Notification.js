import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    senderRole: {
        type: String,
        required: true,
        enum: ['admin', 'company']
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['all_students', 'specific_students', 'all_companies', 'specific_companies', 'all_admins', 'admin', 'student']
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'announcement', // 'announcement', 'job_alert', 'approval', 'reminder', 'system'
        enum: ['announcement', 'job_alert', 'approval', 'reminder', 'system', 'application_update']
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
