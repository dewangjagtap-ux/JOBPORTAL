import express from 'express';
import { getCompanies, approveCompany, getCompanyStats, getCompanyProfile, updateCompanyProfile } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getCompanies);
router.patch('/:id/approve', protect, authorize('admin'), approveCompany);
router.get('/stats', protect, authorize('company'), getCompanyStats);
router.get('/profile', protect, authorize('company'), getCompanyProfile);
router.put('/profile', protect, authorize('company'), upload.single('logo'), updateCompanyProfile);

export default router;
