import { Request, Response } from 'express';
import Job from '../models/Job';
import Company from '../models/Company';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

// ── Create Job ─────────────────────────────────────────────
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const recruiter = await Company.findOne({ recruiter: req.user?.id });
  if (!recruiter) {
    res.status(400).json({ success: false, message: 'Create a company profile first' });
    return;
  }

  const job = await Job.create({
    ...req.body,
    recruiter: req.user?.id,
    company: recruiter._id,
  });

  res.status(201).json({ success: true, job });
};

// ── Get All Jobs (with search, filter, pagination) ─────────
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    location,
    jobType,
    experienceLevel,
    minSalary,
    maxSalary,
    isRemote,
    page = '1',
    limit = '10',
    sortBy = 'createdAt',
  } = req.query;

  const query: any = { status: 'active' };

  // Full text search
  if (search) {
    query.$text = { $search: search as string };
  }

  // Filters
  if (location) query.location = { $regex: location, $options: 'i' };
  if (jobType) query.jobType = jobType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (isRemote === 'true') query.isRemote = true;
  if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
  if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sortOptions: any = {};
  if (sortBy === 'salary') sortOptions['salary.min'] = -1;
  else if (sortBy === 'views') sortOptions.views = -1;
  else sortOptions.createdAt = -1;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'name logo location industry')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    jobs,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

// ── Get Single Job ─────────────────────────────────────────
export const getJob = async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'name logo location industry website size')
    .populate('recruiter', 'name email avatar');

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  // Increment views
  await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, job });
};

// ── Update Job ─────────────────────────────────────────────
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.recruiter.toString() !== req.user?.id) {
    res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    return;
  }

  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, job: updated });
};

// ── Delete Job ─────────────────────────────────────────────
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    return;
  }

  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted successfully' });
};

// ── Get Recruiter's Jobs ───────────────────────────────────
export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const jobs = await Job.find({ recruiter: req.user?.id })
    .populate('company', 'name logo')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: jobs.length, jobs });
};

// ── Toggle Job Status ──────────────────────────────────────
export const toggleJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.recruiter.toString() !== req.user?.id) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  job.status = job.status === 'active' ? 'closed' : 'active';
  await job.save();

  res.json({ success: true, message: `Job is now ${job.status}`, job });
};