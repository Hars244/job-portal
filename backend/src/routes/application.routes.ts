import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/my',                          protect, authorize('jobseeker'),           getMyApplications);
router.post('/:jobId/apply',               protect, authorize('jobseeker'),           applyForJob);
router.get('/:jobId/job-applications',     protect, authorize('recruiter', 'admin'),  getJobApplications);
router.patch('/:id/status',                protect, authorize('recruiter', 'admin'),  updateApplicationStatus);
router.delete('/:id/withdraw',             protect, authorize('jobseeker'),           withdrawApplication);

export default router;