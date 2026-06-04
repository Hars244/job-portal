import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import PostJobPage from './pages/dashboard/PostJobPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Pages (we'll build these next)
import HomePage from './pages/HomePage'
import JobsPage from './pages/jobs/JobsPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import JobseekerDashboard from './pages/dashboard/JobseekerDashboard'
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard'
import NotFoundPage from './pages/NotFoundPage'

import CompanyProfilePage from './pages/dashboard/CompanyProfilePage'

// Route guards
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={
          <RoleRedirect />
        } />
        <Route path="/dashboard/jobseeker/*" element={
          <ProtectedRoute roles={['jobseeker']}>
            <JobseekerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/recruiter/*" element={
          <ProtectedRoute roles={['recruiter', 'admin']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/recruiter/post-job" element={
          <ProtectedRoute roles={['recruiter', 'admin']}>
            <PostJobPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/jobseeker/profile" element={
          <ProtectedRoute roles={['jobseeker']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/recruiter/profile" element={
          <ProtectedRoute roles={['recruiter', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/recruiter/analytics" element={
          <ProtectedRoute roles={['recruiter', 'admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="/dashboard/recruiter/company" element={
        <ProtectedRoute roles={['recruiter', 'admin']}>
          <CompanyProfilePage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (user?.role === 'recruiter' || user?.role === 'admin') {
    return <Navigate to="/dashboard/recruiter" replace />
  }
  return <Navigate to="/dashboard/jobseeker" replace />
}