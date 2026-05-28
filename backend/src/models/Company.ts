import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  location: string;
  industry: string;
  size: string;
  founded?: number;
  recruiter: mongoose.Types.ObjectId;
  isVerified: boolean;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    website: String,
    logo: String,
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: [true, 'Company size is required'],
    },
    founded: Number,
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);