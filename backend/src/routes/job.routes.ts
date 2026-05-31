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
import Job from '../models/Job';
import Application from '../models/Application';

const router = Router();

router.get('/',                    getJobs);
router.get('/:id',                 getJob);
router.post('/',                   protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id',                 protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id',              protect, authorize('recruiter', 'admin'), deleteJob);
router.get('/recruiter/my-jobs',   protect, authorize('recruiter', 'admin'), getMyJobs);
router.patch('/:id/toggle-status', protect, authorize('recruiter', 'admin'), toggleJobStatus);

// Analytics endpoint
router.get('/analytics/overview', protect, authorize('recruiter', 'admin'), async (req: any, res: any) => {
  const Application = require('../models/Application').default;

  // Get recruiter's jobs
  const recruiterJobs = await Job.find({ recruiter: req.user.id }).lean();
  const jobIds = recruiterJobs.map((j: any) => j._id);

  // Total stats
  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
  const totalViews = recruiterJobs.reduce((sum: number, j: any) => sum + (j.views || 0), 0);
  const hiredCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'hired' });

  // Applications by status
  const statusBreakdown = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Applications over last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const applicationsOverTime = await Application.aggregate([
    { $match: { job: { $in: jobIds }, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top performing jobs
  const topJobs = recruiterJobs
    .sort((a: any, b: any) => b.applicationsCount - a.applicationsCount)
    .slice(0, 5)
    .map((j: any) => ({
      title: j.title,
      applications: j.applicationsCount,
      views: j.views,
    }));

  res.json({
    success: true,
    stats: {
      totalApplications,
      totalViews,
      totalJobs: recruiterJobs.length,
      hiredCount,
      hiringRate: totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0,
    },
    statusBreakdown: statusBreakdown.map((s: any) => ({
      name: s._id,
      value: s.count,
    })),
    applicationsOverTime: applicationsOverTime.map((d: any) => ({
      date: d._id,
      applications: d.count,
    })),
    topJobs,
  });
});

export default router;