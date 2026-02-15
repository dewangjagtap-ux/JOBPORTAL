import express from 'express';
import { updateProfile, getProfile } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), updateProfile);

export default router;
