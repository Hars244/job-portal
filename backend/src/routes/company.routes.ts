import { Router } from 'express';
import {
  createCompany,
  getMyCompany,
  updateCompany,
  getCompanies,
  getCompany,
} from '../controllers/company.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',          getCompanies);
router.get('/my',        protect, authorize('recruiter'), getMyCompany);
router.get('/:id',       getCompany);
router.post('/',         protect, authorize('recruiter'), createCompany);
router.put('/my',        protect, authorize('recruiter'), updateCompany);

export default router;