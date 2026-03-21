import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getStudentPlacementProbability, 
    uploadResumeForAI,
    getResumeBasedQuestions,
    evaluateMockAnswer
} from '../controllers/aiController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/student/placement-probability/:studentId', protect, getStudentPlacementProbability);

// Resume-Based Interview AI routes
router.post('/resume/upload', protect, upload.single('resume'), uploadResumeForAI);
router.get('/interview/resume-questions/:studentId', protect, getResumeBasedQuestions);
router.post('/interview/mock', protect, evaluateMockAnswer);

export default router;
