import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import User from '../models/User';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

// Update profile
router.put('/profile', protect, async (req: any, res: any) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      bio: req.body.bio,
      experience: req.body.experience,
      education: req.body.education,
      skills: req.body.skills,
    },
    { new: true }
  );
  res.json({ success: true, user });
});

// Save / unsave a job
router.post('/save-job/:jobId', protect, async (req: any, res: any) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const jobId = req.params.jobId;
  const isSaved = user.savedJobs.some(id => id.toString() === jobId);

  if (isSaved) {
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();
    return res.json({ success: true, message: 'Job removed from saved', saved: false });
  } else {
    user.savedJobs.push(jobId as any);
    await user.save();
    return res.json({ success: true, message: 'Job saved successfully', saved: true });
  }
});

// Get saved jobs
router.get('/saved-jobs', protect, async (req: any, res: any) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedJobs',
    populate: { path: 'company', select: 'name logo location industry' },
  });
  res.json({ success: true, savedJobs: user?.savedJobs || [] });
});

export default router;