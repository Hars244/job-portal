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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function RecruiterDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'ai'>('overview')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [showJDGenerator, setShowJDGenerator] = useState(false)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recruiter Dashboard 🎯
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your job postings and applications</p>
          </div>
          <Link
            to="/dashboard/recruiter/post-job"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Total Applications', value: totalApplications, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
            { label: 'Total Jobs', value: jobs?.length || 0, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          ].map(stat => (
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
            { id: 'jobs', label: 'My Jobs', icon: Briefcase },
            { id: 'applications', label: 'Applications', icon: Users },
            { id: 'ai', label: 'AI Tools', icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
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
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Job Postings</h3>
                <button onClick={() => setActiveTab('jobs')} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {jobsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : jobs?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No jobs posted yet</p>
                  <Link to="/dashboard/recruiter/post-job" className="text-blue-600 text-sm hover:underline">Post your first job</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs?.slice(0, 4).map(job => (
                    <div key={job._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.applicationsCount} applications · {job.views} views</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Profile</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{(user?.company as any)?.name || 'No company yet'}</h4>
                <p className="text-sm text-gray-500 mt-1">{(user?.company as any)?.industry || ''}</p>
              </div>
              {!(user?.company as any)?._id && (
                <Link to="/dashboard/recruiter/company"
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100 transition">
                  <Plus className="w-4 h-4" /> Create Company Profile
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">My Jobs ({jobs?.length || 0})</h3>
              <Link to="/dashboard/recruiter/post-job"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Post Job
              </Link>
            </div>
            {jobsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : jobs?.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No jobs posted yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {jobs?.map(job => (
                  <div key={job._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link to={`/jobs/${job._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.applicationsCount} applicants</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {job.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => { setSelectedJobId(job._id); setActiveTab('applications') }}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          View Applications
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(job._id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                          title="Toggle status"
                        >
                          {job.status === 'active' ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate(job._id) }}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select a job to view applications:</p>
              <div className="flex flex-wrap gap-2">
                {jobs?.map(job => (
                  <button
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedJobId === job._id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                  >
                    {job.title} ({job.applicationsCount})
                  </button>
                ))}
              </div>
            </div>

            {selectedJobId && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Applications ({applications?.length || 0})</h3>
                </div>
                {appsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : applications?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No applications yet for this job</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {applications?.map(app => (
                      <div key={app._id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {app.applicant?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{app.applicant?.name}</p>
                              <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                              {app.applicant?.skills && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {app.applicant.skills.slice(0, 3).map(s => (
                                    <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {app.aiScore && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{app.aiScore}</div>
                                <div className="text-xs text-gray-500">AI Score</div>
                              </div>
                            )}
                            <select
                              value={app.status}
                              onChange={e => updateStatusMutation.mutate({ appId: app._id, status: e.target.value })}
                              className={`text-xs px-3 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${statusColors[app.status]}`}
                            >
                              {['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].map(s => (
                                <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white capitalize">{s}</option>
                              ))}
                            </select>
                            {app.resume?.url && (
                              <a href={app.resume.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                                <FileText className="w-3.5 h-3.5" /> Resume
                              </a>
                            )}
                          </div>
                        </div>
                        {app.coverLetter && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{app.coverLetter}</p>
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
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Job Description Generator</h3>
                  <p className="text-xs text-gray-500">Generate professional JDs in seconds</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { key: 'title', label: 'Job Title', placeholder: 'e.g. Full Stack Developer' },
                  { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
                  { key: 'location', label: 'Location', placeholder: 'e.g. Mumbai, India' },
                  { key: 'skills', label: 'Key Skills (comma separated)', placeholder: 'React, Node.js, MongoDB' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{field.label}</label>
                    <input
                      value={(jdForm as any)[field.key]}
                      onChange={e => setJdForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Experience Level</label>
                  <select
                    value={jdForm.experienceLevel}
                    onChange={e => setJdForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                      <option key={l} value={l} className="capitalize">{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Job Type</label>
                  <select
                    value={jdForm.jobType}
                    onChange={e => setJdForm(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateJD}
                disabled={generating || !jdForm.title}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate JD</>}
              </button>

              {generatedJD && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Generated Job Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{generatedJD.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Requirements</h5>
                      <ul className="space-y-1">
                        {generatedJD.requirements?.map((r: string, i: number) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">✓</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Responsibilities</h5>
                      <ul className="space-y-1">
                        {generatedJD.responsibilities?.map((r: string, i: number) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {generatedJD.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2.5 py-1 rounded-lg">{tag}</span>
                    ))}
                  </div>
                  <Link
                    to="/dashboard/recruiter/post-job"
                    state={{ generatedJD, jdForm }}
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <Briefcase className="w-4 h-4" /> Use This JD to Post a Job
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}