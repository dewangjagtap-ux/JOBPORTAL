import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    deleteJob,
    updateJob,
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').get(getJobs).post(protect, authorize('company'), createJob);
router
    .route('/:id')
    .get(getJobById)
    .put(protect, authorize('company'), updateJob)
    .delete(protect, authorize('company', 'admin'), deleteJob);

export default router;
