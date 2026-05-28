import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  company: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  location: string;
  isRemote: boolean;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary: {
    min?: number;
    max?: number;
    currency: string;
    isVisible: boolean;
  };
  status: 'active' | 'closed' | 'draft';
  applicationsCount: number;
  views: number;
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String, trim: true }],
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      required: [true, 'Experience level is required'],
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      isVisible: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    deadline: Date,
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Indexes for fast search and filtering
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ company: 1 });
JobSchema.index({ recruiter: 1 });
JobSchema.index({ jobType: 1, experienceLevel: 1 });
JobSchema.index({ location: 1 });

export default mongoose.model<IJob>('Job', JobSchema);