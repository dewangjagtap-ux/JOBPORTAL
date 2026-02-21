import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Send a notification
// @route   POST /api/notifications
// @access  Private (Admin or Company)
const sendNotification = async (req, res) => {
    const { title, message, recipientType, recipientIds, type, sendEmail: shouldSendEmail } = req.body;

    try {
        let recipients = [];

        if (recipientType === 'specific_students' || recipientType === 'specific_companies' || recipientType === 'admin' || recipientType === 'student') {
            recipients = recipientIds;
        } else if (recipientType === 'all_students') {
            const students = await User.find({ role: 'student' }).select('_id email');
            recipients = students.map(s => s._id);
        } else if (recipientType === 'all_companies') {
            const companies = await User.find({ role: 'company' }).select('_id email');
            recipients = companies.map(c => c._id);
        } else if (recipientType === 'all_admins') {
            const admins = await User.find({ role: 'admin' }).select('_id email');
            recipients = admins.map(a => a._id);
        }

        const notification = await Notification.create({
            sender: req.user._id,
            senderRole: req.user.role,
            recipientType,
            recipients: recipients.map(r => r._id || r),
            title,
            message,
            type: type || 'announcement'
        });

        // Handle Email Notification
        if (shouldSendEmail) {
            let emailRecipients = [];
            if (recipientType === 'all_students' || recipientType === 'all_companies' || recipientType === 'all_admins') {
                // Already fetched above
                emailRecipients = recipients.map(r => r.email).filter(Boolean);
            } else if (recipientIds && recipientIds.length > 0) {
                const users = await User.find({ _id: { $in: recipientIds } }).select('email');
                emailRecipients = users.map(u => u.email).filter(Boolean);
            }

            if (emailRecipients.length > 0) {
                // In a real app, you might want to use a queue or bcc
                // For now, sending individually or simple loop
                for (const email of emailRecipients) {
                    await sendEmail(email, title, message);
                }
            }
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Base query for notifications that aren't deleted by the user
        const baseQuery = { isDeletedBy: { $ne: userId } };

        let roleBasedQuery = {};

        if (userRole === 'admin') {
            // Admins can see:
            // 1. Notifications explicitly sent to admins
            // 2. All notifications sent by ANY admin (for shared oversight)
            roleBasedQuery = {
                $or: [
                    { recipientType: { $in: ['all_admins', 'admin'] } },
                    { recipients: userId },
                    { senderRole: 'admin' }
                ]
            };
        } else if (userRole === 'company') {
            // Companies can see:
            // 1. Notifications explicitly sent to companies
            // 2. All notifications sent by ANY company (for shared oversight)
            roleBasedQuery = {
                $or: [
                    { recipientType: { $in: ['all_companies', 'company'] } },
                    { recipients: userId },
                    { senderRole: 'company' }
                ]
            };
        } else if (userRole === 'student') {
            // Students can see:
            // 1. Notifications explicitly sent to students
            roleBasedQuery = {
                $or: [
                    { recipientType: { $in: ['all_students', 'student'] } },
                    { recipients: userId }
                ]
            };
        }

        const notifications = await Notification.find({
            $and: [baseQuery, roleBasedQuery]
        })
            .populate('sender', 'name email role')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const readIndex = notification.readBy.findIndex(read => read.user.toString() === req.user._id.toString());

        if (readIndex === -1) {
            // Not read yet, so mark as read
            notification.readBy.push({ user: req.user._id });
        } else {
            // Already read, so mark as UNREAD
            notification.readBy.splice(readIndex, 1);
        }

        await notification.save();
        res.json({ message: 'Read status updated', isRead: readIndex === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification for user
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.isDeletedBy.includes(req.user._id)) {
            notification.isDeletedBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    sendNotification,
    getNotifications,
    markAsRead,
    deleteNotification
};
