import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  resume: {
    url: string;
    originalName: string;
  };
  coverLetter?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  aiScore?: number;
  aiFeedback?: string;
  recruiterNotes?: string;
  statusHistory: {
    status: string;
    changedAt: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    resume: {
      url: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiFeedback: String,
    recruiterNotes: String,
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// One application per job per user
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1, createdAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ recruiter: 1, status: 1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);