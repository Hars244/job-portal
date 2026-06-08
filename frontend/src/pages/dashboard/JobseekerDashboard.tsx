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

// Upgraded to premium harmonious semantic colors with /10 dark mode opacity
const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
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

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-emerald-400 dark:focus:bg-white/[0.05] dark:focus:ring-emerald-400/10"

  return (
    <div className="space-y-4">
      {/* Job selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-2 block">
          Select Job to match against
        </label>
        <select
          value={jobId}
          onChange={e => setJobId(e.target.value)}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="" className="bg-white dark:bg-slate-900">Select a job...</option>
          {jobs?.map((job: any) => (
            <option key={job._id} value={job._id} className="bg-white dark:bg-slate-900">{job.title} — {job.company?.name}</option>
          ))}
        </select>
      </div>

      {/* Resume text */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-2 block">
          Paste your resume text
        </label>
        <textarea
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          rows={5}
          placeholder="Paste your resume content here..."
          className={`${inputClasses} resize-none`}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={analyzing || !resumeText || !jobId}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        {analyzing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</>
        ) : (
          <><FileText className="w-5 h-5" /> Analyze Resume</>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.02] space-y-4 mt-2">
          {/* Score */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-950 dark:text-white">Match Score</span>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${result.score >= 70 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <span className={`text-lg font-black ${result.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : result.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {result.score}/100
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">{result.summary}</p>

          {/* Strengths */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>✓</span> Core Strengths
            </h4>
            <ul className="space-y-1.5">
              {result.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-white/60 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 text-xs">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div>
            <h4 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>✕</span> Missing Elements
            </h4>
            <ul className="space-y-1.5">
              {result.gaps?.map((g: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-white/60 flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5 text-xs">•</span> {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>💡</span> Actionable Advice
            </h4>
            <ul className="space-y-1.5">
              {result.suggestions?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-white/60 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 text-xs">•</span> {s}
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (!data?.length) return (
    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
      <BookmarkCheck className="w-12 h-12 text-slate-300 dark:text-white/20 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">No saved jobs yet</h3>
      <p className="text-slate-500 dark:text-white/50 text-sm mb-6 max-w-sm mx-auto">Keep track of roles you're interested in by clicking the bookmark icon on any job posting.</p>
      <Link to="/jobs" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
        Browse Jobs
      </Link>
    </div>
  )

  return (
    <div className="grid gap-4">
      {data.map((job: any) => (
        <Link key={job._id} to={`/jobs/${job._id}`}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/20 block">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white text-lg">{job.title}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">{job.company?.name} · {job.location}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-bold capitalize ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60'}`}>
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
    { label: 'Applications', value: applications?.length || 0, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
    { label: 'In Review', value: applications?.filter(a => a.status === 'reviewing').length || 0, icon: Clock, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' },
    { label: 'Shortlisted', value: applications?.filter(a => a.status === 'shortlisted').length || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Rejected', value: applications?.filter(a => a.status === 'rejected').length || 0, icon: XCircle, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
  ]

  const profileCompletion = () => {
    const fields = [user?.name, user?.email, user?.phone, user?.location, user?.bio, user?.resume?.url, user?.skills?.length]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const completion = profileCompletion()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-white/60">Here is your job search overview.</p>
        </div>

        {/* Profile completion banner */}
        {/* Profile completion banner */}
        {completion < 100 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 mb-10 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-bold text-2xl tracking-tight text-slate-950 dark:text-white">Complete your profile</h3>
                <p className="text-slate-500 dark:text-white/60 font-medium mt-1">A complete profile gets 5x more recruiter views</p>
              </div>
              <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{completion}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 rounded-full h-full transition-all duration-1000"
                style={{ width: `${completion}%` }}
              />
            </div>
            
            {/* Action Pills - Converted to clickable links */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {!user?.phone && (
                <Link to="/dashboard/jobseeker/profile" className="text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">
                  Add Phone
                </Link>
              )}
              {!user?.bio && (
                <Link to="/dashboard/jobseeker/profile" className="text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">
                  Add Bio
                </Link>
              )}
              {!user?.resume?.url && (
                <Link to="/dashboard/jobseeker/profile" className="text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">
                  Upload Resume
                </Link>
              )}
              {!user?.skills?.length && (
                <Link to="/dashboard/jobseeker/profile" className="text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">
                  Add Skills
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-200/50 dark:bg-white/[0.03] p-1.5 rounded-2xl mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'applications', label: 'Applications', icon: Briefcase },
            { id: 'saved', label: 'Saved Jobs', icon: BookmarkCheck },
            { id: 'ai', label: 'AI Tools', icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-[#050816] text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80'
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
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">Recent Applications</h3>
                <button onClick={() => setActiveTab('applications')} className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : applications?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400 dark:text-white/30" />
                  </div>
                  <p className="text-slate-500 dark:text-white/60 font-medium">No applications yet</p>
                  <Link to="/jobs" className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline mt-2 inline-block">Browse jobs</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {applications?.slice(0, 4).map(app => (
                    <div key={app._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border border-transparent dark:hover:border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-950 dark:text-white truncate">{app.job?.title}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">{app.company?.name}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold capitalize shrink-0 ml-4 ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02] flex flex-col">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Your Profile</h3>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-black mb-4">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-lg font-bold text-slate-950 dark:text-white">{user?.name}</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-1">{user?.email}</p>
                {user?.location && <p className="text-sm font-medium text-slate-500 dark:text-white/60">{user?.location}</p>}
              </div>

              {user?.skills && user.skills.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 mb-3 text-center">Top Skills</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {user.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mt-auto">
                {user?.resume?.url ? (
                  <Link to="/dashboard/jobseeker/profile"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-3.5 rounded-2xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                    <FileText className="w-4 h-4" /> Resume Uploaded ✓
                  </Link>
                ) : (
                  <Link to="/dashboard/jobseeker/profile"
                    className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-white/90 transition-colors">
                    <Upload className="w-4 h-4" /> Upload Resume
                  </Link>
                )}
                <Link to="/dashboard/jobseeker/profile"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <User className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">All Applications ({applications?.length || 0})</h3>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : applications?.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-slate-500 dark:text-white/60 font-medium mb-6">You haven't applied to any jobs yet</p>
                <Link to="/jobs" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {applications?.map(app => (
                  <div key={app._id} className="p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <Link to={`/jobs/${app.job?._id}`} className="text-lg font-bold text-slate-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {app.job?.title}
                        </Link>
                        <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-1">{app.company?.name}</p>
                        <p className="text-xs font-semibold text-slate-400 dark:text-white/40 mt-2 uppercase tracking-wider">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`self-start text-xs px-3 py-1.5 rounded-full font-bold capitalize ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Status timeline */}
                    {app.statusHistory && app.statusHistory.length > 1 && (
                      <div className="flex flex-wrap items-center gap-2 mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        {app.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i > 0 && <div className="w-4 sm:w-8 h-0.5 bg-slate-200 dark:bg-white/10" />}
                            <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${statusColors[h.status] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60'}`}>
                              {h.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {app.aiScore && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">AI Match Score: </span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400">{app.aiScore}/100</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Smart Job Match */}
            <div className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm dark:border-blue-500/20 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Smart Job Match</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">AI matches open roles directly to your profile.</p>
                </div>
              </div>

              {(user?.skills?.length ?? 0) === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-sm font-medium text-slate-600 dark:text-white/60">Add skills to your profile to unlock personalized AI matching.</p>
                </div>
              ) : matchLoading ? (
                <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 py-10">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">Analyzing market data...</span>
                </div>
              ) : aiMatches?.length > 0 ? (
                <div className="space-y-4">
                  {aiMatches.slice(0, 3).map((match: any) => (
                    <Link key={match.jobId} to={`/jobs/${match.jobId}`}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-blue-500/50">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="font-bold text-slate-950 dark:text-white">{match.job?.title}</p>
                        <span className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 px-2.5 py-1 text-xs font-black text-blue-700 dark:text-blue-400">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">{match.reason}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-sm font-medium text-slate-600 dark:text-white/60">No strong matches found yet. Try adding more relevant skills!</p>
                </div>
              )}
            </div>

            {/* Resume Analyzer */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm dark:border-emerald-500/20 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Resume Analyzer</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">Get actionable AI feedback before you apply.</p>
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