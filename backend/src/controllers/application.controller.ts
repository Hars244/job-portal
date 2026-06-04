import { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { sendApplicationConfirmationEmail } from '../services/email.service';
import User from '../models/User';
import { sendStatusUpdateEmail } from '../services/email.service';
import { sendNotification } from '../services/socket.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

// ── Apply for a Job ────────────────────────────────────────
export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.status !== 'active') {
    res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    return;
  }

  const existing = await Application.findOne({
    job: req.params.jobId as any,
    applicant: req.user?.id as any,
  });

  if (existing) {
    res.status(400).json({ success: false, message: 'You have already applied for this job' });
    return;
  }

  const application = await Application.create({
    job: req.params.jobId as any,
    applicant: req.user?.id as any,
    recruiter: job.recruiter,
    company: job.company,
    resume: req.body.resume,
    coverLetter: req.body.coverLetter,
    statusHistory: [{ status: 'pending', changedAt: new Date() }],
  });

  const applicantUser = await User.findById(req.user?.id);
  if (applicantUser) {
    sendApplicationConfirmationEmail(
      applicantUser.email,
      applicantUser.name,
      job.title,
      (job.company as any)?.name || 'Company'
    );
    sendNotification(
      job.recruiter.toString(),
      `New application received for ${job.title}`,
      'application',
      `/dashboard/recruiter`
    );
  }
  // Increment applications count
  await Job.findByIdAndUpdate(req.params.jobId, {
    $inc: { applicationsCount: 1 },
  });

  res.status(201).json({ success: true, message: 'Application submitted successfully', application });
};

// ── Get My Applications (jobseeker) ───────────────────────
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const applications = await Application.find({ applicant: req.user?.id })
    .populate('job', 'title location jobType salary status')
    .populate('company', 'name logo')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
};

// ── Get Applications for a Job (recruiter) ─────────────────
export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email avatar skills experience education resume')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
};

// ── Update Application Status (recruiter) ─────────────────
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, note } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  if (application.recruiter.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  application.status = status;
  application.statusHistory.push({ status, changedAt: new Date(), note });
  await application.save();
  const applicant = await User.findById(application.applicant);
  const jobDoc = await Job.findById(application.job).populate('company');
  if (applicant && jobDoc) {
    sendStatusUpdateEmail(
      applicant.email,
      applicant.name,
      jobDoc.title,
      (jobDoc.company as any)?.name || 'Company',
      status
    );
    sendNotification(
      application.applicant.toString(),
      `Your application status changed to ${status}`,
      'status',
      `/dashboard/jobseeker`
    );
  }
  res.json({ success: true, message: 'Application status updated', application });
};

// ── Withdraw Application (jobseeker) ──────────────────────
export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  if (application.applicant.toString() !== req.user?.id) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  await application.deleteOne();

  await Job.findByIdAndUpdate(application.job, {
    $inc: { applicationsCount: -1 },
  });

  res.json({ success: true, message: 'Application withdrawn successfully' });
};