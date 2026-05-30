export interface User {
  id: string
  name: string
  email: string
  role: 'jobseeker' | 'recruiter' | 'admin'
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  skills: string[]
  experience?: string
  education?: string
  isEmailVerified: boolean
  company?: Company
  savedJobs: string[]
  resume?: {
    url: string
    originalName: string
    uploadedAt: string
  }
}

export interface Company {
  _id: string
  name: string
  description?: string
  website?: string
  logo?: string
  location: string
  industry: string
  size: string
  founded?: number
  isVerified: boolean
}

export interface Job {
  _id: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  company: Company
  recruiter: string
  location: string
  isRemote: boolean
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  salary: {
    min?: number
    max?: number
    currency: string
    isVisible: boolean
  }
  status: 'active' | 'closed' | 'draft'
  applicationsCount: number
  views: number
  deadline?: string
  tags: string[]
  createdAt: string
}

export interface Application {
  _id: string
  job: Job
  applicant: User
  company: Company
  resume: { url: string; originalName: string }
  coverLetter?: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
  aiScore?: number
  aiFeedback?: string
  statusHistory: { status: string; changedAt: string; note?: string }[]
  createdAt: string
}

export interface Notification {
  id: string
  message: string
  type: 'application' | 'status' | 'job' | 'general'
  read: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data?: T[]
  jobs?: T[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}