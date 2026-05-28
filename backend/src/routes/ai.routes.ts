import { Router } from 'express';
import {
  resumeAnalyzer,
  smartJobMatch,
  jdGenerator,
  interviewPrep,
} from '../controllers/ai.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/resume-analyze',  protect, authorize('jobseeker'),           resumeAnalyzer);
router.get('/job-match',        protect, authorize('jobseeker'),           smartJobMatch);
router.post('/generate-jd',     protect, authorize('recruiter', 'admin'),  jdGenerator);
router.post('/interview-prep',  protect, authorize('jobseeker'),           interviewPrep);

export default router;