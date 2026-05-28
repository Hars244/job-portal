import { Request, Response } from 'express';
import {
  analyzeResume,
  getJobMatches,
  generateJobDescription,
  generateInterviewQuestions,
} from '../services/ai.service';
import Job from '../models/Job';
import User from '../models/User';
import Application from '../models/Application';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

// ── Resume Analyzer ────────────────────────────────────────
export const resumeAnalyzer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeText, jobId } = req.body;

  if (!resumeText || !jobId) {
    res.status(400).json({ success: false, message: 'resumeText and jobId are required' });
    return;
  }

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  const analysis = await analyzeResume(resumeText, job.description, job.title);

  // Save AI score to application if exists
  const application = await Application.findOne({
    job: jobId,
    applicant: req.user?.id,
  });

  if (application) {
    application.aiScore = analysis.score;
    application.aiFeedback = analysis.summary;
    await application.save();
  }

  res.json({ success: true, analysis });
};

// ── Smart Job Matching ─────────────────────────────────────
export const smartJobMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (!user.skills.length) {
    res.status(400).json({ success: false, message: 'Please add skills to your profile first' });
    return;
  }

  // Get active jobs
  const jobs = await Job.find({ status: 'active' }).limit(20).lean();

  const jobsForAI = jobs.map((j) => ({
    id: j._id.toString(),
    title: j.title,
    description: j.description.slice(0, 200),
    skills: j.skills,
    experienceLevel: j.experienceLevel,
  }));

  const matches = await getJobMatches(
    {
      skills: user.skills,
      experience: user.experience || 'Not specified',
      education: user.education || 'Not specified',
      bio: user.bio || 'Not specified',
    },
    jobsForAI
  );

  // Attach full job details to matches
  const enrichedMatches = matches.map((match) => ({
    ...match,
    job: jobs.find((j) => j._id.toString() === match.jobId),
  }));

  res.json({ success: true, matches: enrichedMatches });
};

// ── JD Generator ───────────────────────────────────────────
export const jdGenerator = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, industry, experienceLevel, skills, location, jobType, additionalNotes } = req.body;

  const user = await User.findById(req.user?.id).populate('company');
  const companyName = (user?.company as any)?.name || 'Our Company';

  const result = await generateJobDescription({
    title,
    industry,
    experienceLevel,
    skills,
    location,
    jobType,
    companyName,
    additionalNotes,
  });

  res.json({ success: true, generated: result });
};

// ── Interview Prep ─────────────────────────────────────────
export const interviewPrep = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  const questions = await generateInterviewQuestions(
    job.title,
    job.description,
    job.experienceLevel,
    job.skills
  );

  res.json({ success: true, jobTitle: job.title, questions });
};