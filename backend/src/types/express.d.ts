declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: 'jobseeker' | 'recruiter' | 'admin';
      email: string;
    };
  }
}