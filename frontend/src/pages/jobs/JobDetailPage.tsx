import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Briefcase, Clock, DollarSign, Building2,
  Users, Globe, ArrowLeft, Bookmark, Share2,
  CheckCircle, Loader2, Brain, MessageSquare
} from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`)
      return res.data.job
    },
  })

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply')
      navigate('/login')
      return
    }
    if (!user?.resume?.url) {
      toast.error('Please upload your resume first in your dashboard')
      return
    }
    setApplying(true)
    try {
      await api.post(`/applications/${id}/apply`, {
        resume: { url: user.resume.url, originalName: user.resume.originalName },
        coverLetter,
      })
      setApplied(true)
      setShowApplyForm(false)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const handleInterviewPrep = async () => {
    setGeneratingQuestions(true)
    try {
      const res = await api.post('/ai/interview-prep', { jobId: id })
      setInterviewQuestions(res.data.questions)
      toast.success('Interview questions generated!')
    } catch {
      toast.error('Failed to generate questions')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const formatSalary = (salary: any) => {
    if (!salary?.isVisible) return 'Not disclosed'
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`
    if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)} / yr`
    if (salary.min) return `₹${fmt(salary.min)}+ / yr`
    return 'Not disclosed'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050816] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050816] flex items-center justify-center transition-colors duration-300">
        <div className="text-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Job not found</h2>
          <p className="text-slate-500 dark:text-white/60 mt-2 mb-6">This posting may have been removed.</p>
          <Link to="/jobs" className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
            Back to jobs
          </Link>
        </div>
      </div>
    )
  }

  // 👇 ADD THIS LINE HERE: Check if the deadline exists and has passed
  const isExpired = data.deadline ? new Date(data.deadline).getTime() < new Date().getTime() : false;

  const cardClasses = "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"

  const inputClasses = "w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 dark:text-white/50 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job header */}
            <div className={cardClasses}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                    {data.company?.logo ? (
                      <img src={data.company.logo} alt={data.company.name} className="w-10 h-10 object-contain rounded-lg" />
                    ) : (
                      <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                      {data.title}
                    </h1>
                    <Link
                      to={`/companies/${data.company?._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold mt-1 inline-block"
                    >
                      {data.company?.name}
                    </Link>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60">
                        <MapPin className="w-4 h-4" /> {data.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60">
                        <Briefcase className="w-4 h-4 capitalize" /> {data.jobType}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/60">
                        <Users className="w-4 h-4" /> {data.applicationsCount} applicants
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Actions */}
                <div className="hidden sm:flex gap-2 shrink-0">
                  <button className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                {[
                  { label: 'Salary', value: formatSalary(data.salary), icon: DollarSign },
                  { label: 'Job Type', value: data.jobType, icon: Briefcase },
                  { label: 'Experience', value: data.experienceLevel, icon: Users },
                  { label: 'Remote', value: data.isRemote ? 'Yes' : 'No', icon: Globe },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">{item.label}</div>
                    <div className="text-sm font-bold text-slate-950 dark:text-white capitalize mt-1 truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={cardClasses}>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-5">Job Description</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line text-[15px]">
                  {data.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {data.requirements?.length > 0 && (
              <div className={cardClasses}>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-5">Requirements</h2>
                <ul className="space-y-4">
                  {data.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 p-1 shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[15px] leading-relaxed text-slate-600 dark:text-white/70">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {data.responsibilities?.length > 0 && (
              <div className={cardClasses}>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-5">Responsibilities</h2>
                <ul className="space-y-4">
                  {data.responsibilities.map((res: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 p-1 shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[15px] leading-relaxed text-slate-600 dark:text-white/70">{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interview Prep */}
            {isAuthenticated && (
              <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-sm dark:border-purple-500/20 dark:bg-white/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-500/20">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">AI Interview Prep</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">Generate tailored practice questions for this exact role.</p>
                  </div>
                </div>
                
                {!interviewQuestions ? (
                  <button
                    onClick={handleInterviewPrep}
                    disabled={generatingQuestions}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-white/90 dark:text-slate-950 text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50"
                  >
                    {generatingQuestions ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating Prep Material...</>
                    ) : (
                      <><MessageSquare className="w-5 h-5" /> Generate Questions</>
                    )}
                  </button>
                ) : (
                  <div className="space-y-6 mt-6">
                    {['technical', 'behavioral', 'roleSpecific'].map((category) => (
                      <div key={category}>
                        <h3 className="text-sm font-bold tracking-wider text-slate-950 dark:text-white uppercase mb-3">
                          {category === 'roleSpecific' ? 'Role Specific' : category}
                        </h3>
                        <div className="space-y-3">
                          {interviewQuestions[category]?.map((q: any, i: number) => (
                            <div key={i} className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-5 border border-slate-200 dark:border-white/5 transition-all hover:border-purple-200 dark:hover:border-purple-500/30">
                              <p className="font-bold text-slate-950 dark:text-white text-[15px] mb-2">{q.question}</p>
                              <div className="flex items-start gap-2">
                                <span className="text-purple-500 text-sm mt-0.5">💡</span>
                                <p className="text-sm font-medium text-slate-600 dark:text-white/60 leading-relaxed">{q.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Apply card */}
            {/* Apply card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02] sticky top-24">
              <div className="text-center mb-6 border-b border-slate-100 dark:border-white/5 pb-6">
                <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{formatSalary(data.salary)}</div>
                
                {/* Updated Deadline Badge: Turns Red if Expired */}
                {data.deadline && (
                  <div className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mt-3 ${
                    isExpired 
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' 
                      : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {isExpired ? 'Applications Closed' : `Deadline: ${new Date(data.deadline).toLocaleDateString()}`}
                  </div>
                )}
              </div>

              {/* Updated Apply Button Logic */}
              {isExpired ? (
                <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 font-bold py-4 px-4 rounded-2xl text-center flex items-center justify-center gap-2 cursor-not-allowed">
                  Deadline Passed
                </div>
              ) : applied ? (
                <div className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold py-4 px-4 rounded-2xl text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Applied Successfully
                </div>
              ) : showApplyForm ? (
                <div className="space-y-4">
                  <textarea
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Write a cover letter (optional)..."
                    rows={5}
                    className={`${inputClasses} resize-none`}
                  />
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {applying ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Application'}
                  </button>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="w-full text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white text-sm font-bold py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => isAuthenticated ? setShowApplyForm(true) : navigate('/login')}
                  className="w-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-white/90 dark:text-slate-950 text-white font-bold py-4 rounded-2xl transition-all shadow-sm"
                >
                  {isAuthenticated ? 'Apply for this role' : 'Login to Apply'}
                </button>
              )}
            </div>

            {/* Skills */}
            {data.skills?.length > 0 && (
              <div className={cardClasses}>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 text-sm rounded-xl font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company info */}
            {data.company && (
              <div className={cardClasses}>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-5">About the Company</h3>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                    {data.company?.logo ? (
                      <img src={data.company.logo} alt={data.company.name} className="w-8 h-8 object-contain rounded-md" />
                    ) : (
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-950 dark:text-white">{data.company.name}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-white/60">{data.company.industry}</div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5 text-[15px] font-medium text-slate-600 dark:text-white/70">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-white/40 shrink-0" /> 
                    <span>{data.company.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-400 dark:text-white/40 shrink-0" /> 
                    <span>{data.company.size} employees</span>
                  </div>
                  {data.company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-slate-400 dark:text-white/40 shrink-0" />
                      <a href={data.company.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}