import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import User from '../models/User';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-resume', protect, upload.single('resume'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ success: false, message: 'Only PDF files allowed' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'resumes',
          flags: 'attachment',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const cloudinaryResult = result as any;
    const downloadUrl = cloudinaryResult.secure_url.replace(
      '/upload/',
      '/upload/fl_attachment/'
    );
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          originalName: req.file.originalname,
          uploadedAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({ success: true, resume: user?.resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
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

router.delete('/resume', protect, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user?.resume?.url) {
      return res.status(404).json({ success: false, message: 'No resume found' })
    }

    // Delete from Cloudinary
    if (user.resume.publicId) {
      await cloudinary.uploader.destroy(user.resume.publicId, { resource_type: 'raw' })
    }

    // Remove from DB
    await User.findByIdAndUpdate(req.user.id, { $unset: { resume: 1 } })

    res.json({ success: true, message: 'Resume deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resume' })
  }
})

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