import express from 'express';
import { getPlatformStats, getAllUsers, deleteUser, getAdminProfile, updateAdminProfile } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getPlatformStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/profile', protect, authorize('admin'), getAdminProfile);
router.put('/profile', protect, authorize('admin'), upload.single('photo'), updateAdminProfile);

export default router;
