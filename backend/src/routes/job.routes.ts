import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus,
} from '../controllers/job.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',                    getJobs);
router.get('/:id',                 getJob);
router.post('/',                   protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id',                 protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id',              protect, authorize('recruiter', 'admin'), deleteJob);
router.get('/recruiter/my-jobs',   protect, authorize('recruiter', 'admin'), getMyJobs);
router.patch('/:id/toggle-status', protect, authorize('recruiter', 'admin'), toggleJobStatus);

export default router;