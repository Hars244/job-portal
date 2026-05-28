import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'jobseeker' | 'recruiter' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  // Jobseeker specific
  resume?: {
    url: string;
    publicId: string;
    originalName: string;
    uploadedAt: Date;
  };
  skills: string[];
  experience?: string;
  education?: string;
  savedJobs: mongoose.Types.ObjectId[];
  // Recruiter specific
  company?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter', 'admin'],
      default: 'jobseeker',
    },
    avatar: String,
    phone: String,
    location: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    resume: {
      url: String,
      publicId: String,
      originalName: String,
      uploadedAt: Date,
    },
    skills: [{ type: String, trim: true }],
    experience: String,
    education: String,
    savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);