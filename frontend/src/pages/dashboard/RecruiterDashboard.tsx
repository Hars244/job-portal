import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, Eye, Plus, Building2,
  TrendingUp, ChevronRight, Loader2, ToggleLeft,
  ToggleRight, Trash2, Brain, FileText, Zap
} from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import type { Job, Application } from '../../types'
import toast from 'react-hot-toast'

// Upgraded to premium harmonious semantic colors with /10 dark mode opacity
const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
}

export default function RecruiterDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'ai'>('overview')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jdForm, setJdForm] = useState({ title: '', industry: '', experienceLevel: 'mid', skills: '', location: '', jobType: 'full-time', additionalNotes: '' })
  const [generatedJD, setGeneratedJD] = useState<any>(null)
  const [generating, setGenerating] = useState(false)

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/recruiter/my-jobs')
      return res.data.jobs as Job[]
    },
  })

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', selectedJobId],
    queryFn: async () => {
      const res = await api.get(`/applications/${selectedJobId}/job-applications`)
      return res.data.applications as Application[]
    },
    enabled: !!selectedJobId,
  })

  const toggleMutation = useMutation({
    mutationFn: (jobId: string) => api.patch(`/jobs/${jobId}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      toast.success('Job status updated!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => api.delete(`/jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      toast.success('Job deleted!')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      api.patch(`/applications/${appId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', selectedJobId] })
      toast.success('Application status updated!')
    },
  })

  const handleGenerateJD = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/ai/generate-jd', {
        ...jdForm,
        skills: jdForm.skills.split(',').map(s => s.trim()),
      })
      setGeneratedJD(res.data.generated)
      toast.success('Job description generated!')
    } catch {
      toast.error('Failed to generate JD')
    } finally {
      setGenerating(false)
    }
  }

  const totalApplications = jobs?.reduce((sum, job) => sum + (job.applicationsCount || 0), 0) || 0
  const totalViews = jobs?.reduce((sum, job) => sum + (job.views || 0), 0) || 0
  const activeJobs = jobs?.filter(j => j.status === 'active').length || 0

  const inputClasses = "w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"
  const cardClasses = "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Recruiter Dashboard 🎯
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-white/60">Manage your job postings and applications</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/recruiter/analytics"
              className="flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/80 px-6 py-3.5 rounded-2xl font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            >
              <TrendingUp className="w-5 h-5" /> Analytics
            </Link>
            <Link
              to="/dashboard/recruiter/post-job"
              className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90 px-6 py-3.5 rounded-2xl font-bold transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Post a Job
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Total Applications', value: totalApplications, icon: Users, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' },
            { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Total Jobs', value: jobs?.length || 0, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
          ].map(stat => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-200/50 dark:bg-white/[0.03] p-1.5 rounded-2xl mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'jobs', label: 'My Jobs', icon: Briefcase },
            { id: 'applications', label: 'Applications', icon: Users },
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
            <div className={`lg:col-span-2 ${cardClasses}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">Recent Job Postings</h3>
                <button onClick={() => setActiveTab('jobs')} className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {jobsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : jobs?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400 dark:text-white/30" />
                  </div>
                  <p className="text-slate-500 dark:text-white/60 font-medium mb-3">No jobs posted yet</p>
                  <Link to="/dashboard/recruiter/post-job" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Post your first job</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs?.slice(0, 4).map(job => (
                    <div key={job._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border border-transparent dark:hover:border-white/5">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{job.title}</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">{job.applicationsCount} applications · {job.views} views</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold capitalize shrink-0 ml-4 ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60'}`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Card */}
            <div className={cardClasses}>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Company Profile</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20">
                  <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-950 dark:text-white">{(user?.company as any)?.name || 'No company yet'}</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-1">{(user?.company as any)?.industry || 'Setup required'}</p>
              </div>
              {!(user?.company as any)?._id && (
                <Link to="/dashboard/recruiter/company"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-white/90 transition-colors">
                  <Plus className="w-4 h-4" /> Create Company Profile
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">My Jobs ({jobs?.length || 0})</h3>
              <Link to="/dashboard/recruiter/post-job"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Post Job
              </Link>
            </div>
            {jobsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : jobs?.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-slate-500 dark:text-white/60 font-medium mb-2">No jobs posted yet</p>
                <Link to="/dashboard/recruiter/post-job" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Create your first listing</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {jobs?.map(job => (
                  <div key={job._id} className="p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <Link to={`/jobs/${job._id}`} className="text-lg font-bold text-slate-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                            <Users className="w-4 h-4" /> {job.applicationsCount} applicants
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                            <Eye className="w-4 h-4" /> {job.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => { setSelectedJobId(job._id); setActiveTab('applications') }}
                          className="text-sm font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                        >
                          View Applications
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(job._id)}
                          className="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/10"
                          title="Toggle status"
                        >
                          {job.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => { if (confirm('Are you sure you want to delete this job?')) deleteMutation.mutate(job._id) }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/10"
                          title="Delete job"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Job selector */}
            <div className={cardClasses}>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-4">Select a job to view applications:</p>
              <div className="flex flex-wrap gap-3">
                {jobs?.map(job => (
                  <button
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedJobId === job._id ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm' : 'bg-white dark:bg-[#050816] text-slate-600 dark:text-white/70 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
                  >
                    {job.title} <span className="opacity-60 ml-1">({job.applicationsCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedJobId && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Applications ({applications?.length || 0})</h3>
                </div>
                {appsLoading ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                ) : applications?.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-300 dark:text-white/20" />
                    </div>
                    <p className="text-slate-500 dark:text-white/60 font-medium">No applications yet for this job.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {applications?.map(app => (
                      <div key={app._id} className="p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0">
                              {app.applicant?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-950 dark:text-white">{app.applicant?.name}</p>
                              <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">{app.applicant?.email}</p>
                              {app.applicant?.skills && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {app.applicant.skills.slice(0, 4).map(s => (
                                    <span key={s} className="text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 px-2.5 py-1 rounded-lg">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 lg:justify-end shrink-0">
                            {app.aiScore && (
                              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-3 py-2 rounded-xl">
                                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <div className="text-sm font-black text-purple-600 dark:text-purple-400">{app.aiScore}/100</div>
                              </div>
                            )}
                            <select
                              value={app.status}
                              onChange={e => updateStatusMutation.mutate({ appId: app._id, status: e.target.value })}
                              className={`text-sm px-4 py-2.5 rounded-xl border-0 font-bold cursor-pointer appearance-none ${statusColors[app.status]}`}
                              style={{ paddingRight: '2.5rem' }} // For custom dropdown arrow space
                            >
                              {['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].map(s => (
                                <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white capitalize font-medium">{s}</option>
                              ))}
                            </select>
                            {app.resume?.url && (
                              <a href={app.resume.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-bold bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-white/90 transition-colors shadow-sm">
                                <FileText className="w-4 h-4" /> View Resume
                              </a>
                            )}
                          </div>
                        </div>
                        {app.coverLetter && (
                          <div className="mt-6 p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2">Cover Letter</p>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-white/70">{app.coverLetter}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-amber-100 bg-white p-6 sm:p-10 shadow-sm dark:border-amber-500/20 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-950 dark:text-white">AI Job Description Generator</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-1">Generate perfectly formatted, highly converting JDs in seconds.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { key: 'title', label: 'Job Title', placeholder: 'e.g. Senior Frontend Engineer' },
                  { key: 'industry', label: 'Industry', placeholder: 'e.g. Financial Technology' },
                  { key: 'location', label: 'Location', placeholder: 'e.g. Remote or Mumbai' },
                  { key: 'skills', label: 'Key Skills (comma separated)', placeholder: 'React, TypeScript, Tailwind' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold text-slate-950 dark:text-white mb-2">{field.label}</label>
                    <input
                      value={(jdForm as any)[field.key]}
                      onChange={e => setJdForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className={inputClasses}
                    />
                  </div>
                ))}
                
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-white mb-2">Experience Level</label>
                  <select
                    value={jdForm.experienceLevel}
                    onChange={e => setJdForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                      <option key={l} value={l} className="capitalize bg-white dark:bg-slate-900">{l}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-white mb-2">Job Type</label>
                  <select
                    value={jdForm.jobType}
                    onChange={e => setJdForm(prev => ({ ...prev, jobType: e.target.value }))}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(t => (
                      <option key={t} value={t} className="capitalize bg-white dark:bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateJD}
                disabled={generating || !jdForm.title}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-sm text-lg"
              >
                {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Magic...</> : <><Zap className="w-5 h-5" /> Generate Job Description</>}
              </button>

              {generatedJD && (
                <div className="mt-10 bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-slate-950 dark:text-white mb-4">Generated Preview</h4>
                    <p className="text-[15px] text-slate-600 dark:text-white/70 mb-8 leading-relaxed">{generatedJD.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-4">
                          <span>✓</span> Requirements
                        </h5>
                        <ul className="space-y-3">
                          {generatedJD.requirements?.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-white/70 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5 text-xs">•</span> <span className="leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-4">
                          <span>📋</span> Responsibilities
                        </h5>
                        <ul className="space-y-3">
                          {generatedJD.responsibilities?.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-white/70 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5 text-xs">•</span> <span className="leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {generatedJD.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs font-bold bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                      <Link
                        to="/dashboard/recruiter/post-job"
                        state={{ generatedJD, jdForm }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-white/90 transition-all w-full sm:w-auto shadow-sm"
                      >
                        <Briefcase className="w-5 h-5" /> Proceed to Post this Job
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}