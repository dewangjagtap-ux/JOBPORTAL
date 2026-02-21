import express from 'express';
import {
    sendNotification,
    getNotifications,
    markAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, sendNotification)
    .get(protect, getNotifications);

router.route('/:id/read')
    .put(protect, markAsRead);

router.route('/:id')
    .delete(protect, deleteNotification);

export default router;
