import express from 'express';
import {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    getCompanyApplications,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('student'), upload.single('resume'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/company', protect, authorize('company'), getCompanyApplications);
router.get('/job/:jobId', protect, authorize('company'), getJobApplications);
router.patch('/:id/status', protect, authorize('company'), updateApplicationStatus);

export default router;
