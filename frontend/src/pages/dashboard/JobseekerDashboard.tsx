import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, Brain, BookmarkCheck,
  TrendingUp, Clock, CheckCircle, XCircle,
  ChevronRight, Loader2, User, Upload, Building2
} from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import type { Application } from '../../types'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}
function ResumeAnalyzerTool() {
  const [resumeText, setResumeText] = useState('')
  const [jobId, setJobId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { data: jobs } = useQuery({
    queryKey: ['jobs-for-analyzer'],
    queryFn: async () => {
      const res = await api.get('/jobs')
      return res.data.jobs
    },
  })

  const handleAnalyze = async () => {
    if (!resumeText || !jobId) {
      toast.error('Please select a job and paste your resume')
      return
    }
    setAnalyzing(true)
    try {
      const res = await api.post('/ai/resume-analyze', { resumeText, jobId })
      setResult(res.data.analysis)
      toast.success('Resume analyzed!')
    } catch {
      toast.error('Failed to analyze resume')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Job selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
          Select Job to match against
        </label>
        <select
          value={jobId}
          onChange={e => setJobId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select a job...</option>
          {jobs?.map((job: any) => (
            <option key={job._id} value={job._id}>{job.title} — {job.company?.name}</option>
          ))}
        </select>
      </div>

      {/* Resume text */}
      <div>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
          Paste your resume text
        </label>
        <textarea
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          rows={4}
          placeholder="Paste your resume content here..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={analyzing || !resumeText || !jobId}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
      >
        {analyzing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
        ) : (
          <><FileText className="w-4 h-4" /> Analyze Resume</>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
          {/* Score */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Match Score</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${result.score >= 70 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <span className={`text-lg font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.score}/100
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>

          {/* Strengths */}
          <div>
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-1.5">✅ Strengths</h4>
            <ul className="space-y-1">
              {result.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div>
            <h4 className="text-xs font-semibold text-red-500 uppercase mb-1.5">❌ Gaps</h4>
            <ul className="space-y-1">
              {result.gaps?.map((g: string, i: number) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span> {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-xs font-semibold text-blue-500 uppercase mb-1.5">💡 Suggestions</h4>
            <ul className="space-y-1">
              {result.suggestions?.map((s: string, i: number) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
function SavedJobsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await api.get('/users/saved-jobs')
      return res.data.savedJobs
    },
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>

  if (!data?.length) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No saved jobs yet</h3>
      <p className="text-gray-500 text-sm mb-4">Click the bookmark icon on any job to save it</p>
      <Link to="/jobs" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
        Browse Jobs
      </Link>
    </div>
  )

  return (
    <div className="grid gap-4">
      {data.map((job: any) => (
        <Link key={job._id} to={`/jobs/${job._id}`}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow block">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.company?.name} · {job.location}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {job.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
export default function JobseekerDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'ai'>('overview')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my')
      return res.data.applications as Application[]
    },
  })

  const { data: aiMatches, isLoading: matchLoading } = useQuery({
    queryKey: ['job-matches'],
    queryFn: async () => {
      const res = await api.get('/ai/job-match')
      return res.data.matches
    },
    enabled: activeTab === 'ai' && (user?.skills?.length ?? 0) > 0,
  })

  const stats = [
    { label: 'Applications', value: applications?.length || 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'In Review', value: applications?.filter(a => a.status === 'reviewing').length || 0, icon: Clock, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Shortlisted', value: applications?.filter(a => a.status === 'shortlisted').length || 0, icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Rejected', value: applications?.filter(a => a.status === 'rejected').length || 0, icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  ]

  const profileCompletion = () => {
    const fields = [user?.name, user?.email, user?.phone, user?.location, user?.bio, user?.resume?.url, user?.skills?.length]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const completion = profileCompletion()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your job search overview</p>
        </div>

        {/* Profile completion banner */}
        {completion < 100 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Complete your profile</h3>
                <p className="text-blue-100 text-sm">A complete profile gets 5x more recruiter views</p>
              </div>
              <span className="text-3xl font-bold">{completion}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="flex gap-3 mt-4">
              {!user?.phone && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Add phone</span>}
              {!user?.bio && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Add bio</span>}
              {!user?.resume?.url && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Upload resume</span>}
              {!user?.skills?.length && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Add skills</span>}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'applications', label: 'Applications', icon: Briefcase },
            { id: 'saved', label: 'Saved Jobs', icon: BookmarkCheck },
            { id: 'ai', label: 'AI Tools', icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent applications */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                <button onClick={() => setActiveTab('applications')} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : applications?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No applications yet</p>
                  <Link to="/jobs" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Browse jobs</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications?.slice(0, 4).map(app => (
                    <div key={app._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{app.job?.title}</p>
                        <p className="text-xs text-gray-500">{app.company?.name}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ml-3 ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h3>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.location && <p className="text-sm text-gray-500">{user?.location}</p>}
              </div>

              {user?.skills && user.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-md">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {user?.resume?.url ? (
                  <Link to="/dashboard/jobseeker/profile"
                    className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition">
                    <FileText className="w-4 h-4" /> Resume Uploaded ✓
                  </Link>
                ) : (
                  <Link to="/dashboard/jobseeker/profile"
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100 transition">
                    <Upload className="w-4 h-4" /> Upload Resume
                  </Link>
                )}
                <Link to="/dashboard/jobseeker/profile"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <User className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">All Applications ({applications?.length || 0})</h3>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : applications?.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">You haven't applied to any jobs yet</p>
                <Link to="/jobs" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {applications?.map(app => (
                  <div key={app._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                          {app.job?.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">{app.company?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Status timeline */}
                    {app.statusHistory && app.statusHistory.length > 1 && (
                      <div className="flex items-center gap-2 mt-3">
                        {app.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i > 0 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[h.status] || 'bg-gray-100 text-gray-600'}`}>
                              {h.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {app.aiScore && (
                      <div className="mt-3 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-gray-500">AI Match Score: </span>
                        <span className="text-xs font-semibold text-purple-600">{app.aiScore}/100</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Job Match */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Smart Job Match</h3>
                  <p className="text-xs text-gray-500">AI matches jobs to your profile</p>
                </div>
              </div>
              {(user?.skills?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500">Add skills to your profile to use this feature</p>
              ) : matchLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Finding matches...</span>
                </div>
              ) : aiMatches?.length > 0 ? (
                <div className="space-y-3">
                  {aiMatches.slice(0, 3).map((match: any) => (
                    <Link key={match.jobId} to={`/jobs/${match.jobId}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{match.job?.title}</p>
                        <span className="text-xs font-bold text-blue-600">{match.matchScore}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{match.reason}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No matches found. Try adding more skills.</p>
              )}
            </div>

            {/* Resume Analyzer */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Resume Analyzer</h3>
                  <p className="text-xs text-gray-500">Get AI feedback on your resume</p>
                </div>
              </div>
              <ResumeAnalyzerTool />
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <SavedJobsTab />
        )}
      </div>
    </div>
  )
}