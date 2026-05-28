import { Request, Response } from 'express';
import Company from '../models/Company';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

// ── Create Company ─────────────────────────────────────────
export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await Company.findOne({ recruiter: req.user?.id });
  if (existing) {
    res.status(400).json({ success: false, message: 'You already have a company profile' });
    return;
  }

  const company = await Company.create({
    ...req.body,
    recruiter: req.user?.id,
  });

  // Link company to recruiter
  await User.findByIdAndUpdate(req.user?.id, { company: company._id });

  res.status(201).json({ success: true, company });
};

// ── Get My Company ─────────────────────────────────────────
export const getMyCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  const company = await Company.findOne({ recruiter: req.user?.id });
  if (!company) {
    res.status(404).json({ success: false, message: 'No company profile found' });
    return;
  }
  res.json({ success: true, company });
};

// ── Update Company ─────────────────────────────────────────
export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  const company = await Company.findOneAndUpdate(
    { recruiter: req.user?.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!company) {
    res.status(404).json({ success: false, message: 'No company profile found' });
    return;
  }

  res.json({ success: true, company });
};

// ── Get All Companies (public) ─────────────────────────────
export const getCompanies = async (_req: Request, res: Response): Promise<void> => {
  const companies = await Company.find().select('name logo industry location size isVerified');
  res.json({ success: true, companies });
};

// ── Get Single Company (public) ────────────────────────────
export const getCompany = async (req: Request, res: Response): Promise<void> => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    res.status(404).json({ success: false, message: 'Company not found' });
    return;
  }
  res.json({ success: true, company });
};