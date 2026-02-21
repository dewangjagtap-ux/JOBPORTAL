import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Send a notification
// @route   POST /api/notifications
// @access  Private (Admin or Company)
const sendNotification = async (req, res) => {
    const { title, message, recipientType, recipientIds, type } = req.body;

    try {
        let recipients = [];

        if (recipientType === 'specific_students' || recipientType === 'specific_companies' || recipientType === 'admin' || recipientType === 'student') {
            recipients = recipientIds;
        }

        const notification = await Notification.create({
            sender: req.user._id,
            senderRole: req.user.role,
            recipientType,
            recipients,
            title,
            message,
            type: type || 'announcement'
        });

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

        const query = {
            $and: [
                { isDeletedBy: { $ne: userId } },
                {
                    $or: [
                        { recipients: userId },
                        { recipientType: 'all_students', senderRole: { $ne: userRole } }, // prevent sender seeing global if they fit role
                        { recipientType: 'all_companies' },
                        { recipientType: 'all_admins' }
                    ]
                }
            ]
        };

        // Refine global broadcast logic based on role
        if (userRole === 'student') {
            query.$and[1].$or = [
                { recipients: userId },
                { recipientType: 'all_students' }
            ];
        } else if (userRole === 'company') {
            query.$and[1].$or = [
                { recipients: userId },
                { recipientType: 'all_companies' }
            ];
        } else if (userRole === 'admin') {
            query.$and[1].$or = [
                { recipients: userId },
                { recipientType: 'all_admins' }
            ];
        }

        // Also include notifications SENT by others in the same role (for admin and company)
        // or just notifications SENT by the user themselves
        let sentQuery = { sender: userId, isDeletedBy: { $ne: userId } };
        if (userRole === 'admin') {
            sentQuery = { senderRole: 'admin', isDeletedBy: { $ne: userId } };
        } else if (userRole === 'company') {
            sentQuery = { senderRole: 'company', isDeletedBy: { $ne: userId } };
        }

        const notifications = await Notification.find({
            $or: [query, sentQuery]
        }).populate('sender', 'name email role').sort({ createdAt: -1 });

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

        // Check if already read
        const alreadyRead = notification.readBy.find(read => read.user.toString() === req.user._id.toString());

        if (!alreadyRead) {
            notification.readBy.push({ user: req.user._id });
            await notification.save();
        }

        res.json({ message: 'Marked as read' });
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
