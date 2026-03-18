import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getPlacementTrends,
    getStudentPredictions,
    getCompanyPredictions,
    getSummaryInsights
} from '../controllers/aiInsightsController.js';

const router = express.Router();

router.get('/placement-trends', protect, admin, getPlacementTrends);
router.get('/student-predictions', protect, admin, getStudentPredictions);
router.get('/company-predictions', protect, admin, getCompanyPredictions);
router.get('/summary', protect, admin, getSummaryInsights);

export default router;
