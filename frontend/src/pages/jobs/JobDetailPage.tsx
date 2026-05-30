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
    if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)} per year`
    if (salary.min) return `₹${fmt(salary.min)}+ per year`
    return 'Not disclosed'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 mt-2 inline-block">Back to jobs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {data.company?.logo ? (
                    <img src={data.company.logo} alt={data.company.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.title}</h1>
                  <Link
                    to={`/companies/${data.company?._id}`}
                    className="text-blue-600 hover:underline font-medium mt-1 inline-block"
                  >
                    {data.company?.name}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" /> {data.location}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 capitalize" /> {data.jobType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" /> {data.applicationsCount} applicants
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Salary', value: formatSalary(data.salary), icon: DollarSign },
                  { label: 'Job Type', value: data.jobType, icon: Briefcase },
                  { label: 'Experience', value: data.experienceLevel, icon: Users },
                  { label: 'Remote', value: data.isRemote ? 'Yes' : 'No', icon: Globe },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <item.icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{data.description}</p>
            </div>

            {/* Requirements */}
            {data.requirements?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {data.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {data.responsibilities?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {data.responsibilities.map((res: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interview Prep */}
            {isAuthenticated && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Interview Prep</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-generated questions for this role</p>
                  </div>
                </div>
                {!interviewQuestions ? (
                  <button
                    onClick={handleInterviewPrep}
                    disabled={generatingQuestions}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-60"
                  >
                    {generatingQuestions ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                      <><MessageSquare className="w-4 h-4" /> Generate Interview Questions</>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {['technical', 'behavioral', 'roleSpecific'].map((category) => (
                      <div key={category}>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 capitalize mb-2">
                          {category === 'roleSpecific' ? 'Role Specific' : category} Questions
                        </h3>
                        <div className="space-y-2">
                          {interviewQuestions[category]?.map((q: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{q.question}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">💡 {q.tip}</p>
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatSalary(data.salary)}</div>
                {data.deadline && (
                  <div className="flex items-center justify-center gap-1 text-sm text-orange-500 mt-1">
                    <Clock className="w-4 h-4" />
                    Deadline: {new Date(data.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {applied ? (
                <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 font-semibold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Applied Successfully
                </div>
              ) : showApplyForm ? (
                <div className="space-y-4">
                  <textarea
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Write a cover letter (optional)..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
                  </button>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => isAuthenticated ? setShowApplyForm(true) : navigate('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {isAuthenticated ? 'Apply Now' : 'Login to Apply'}
                </button>
              )}
            </div>

            {/* Skills */}
            {data.skills?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm rounded-lg font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company info */}
            {data.company && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{data.company.name}</div>
                    <div className="text-sm text-gray-500">{data.company.industry}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {data.company.location}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {data.company.size} employees</div>
                  {data.company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a href={data.company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {data.company.website}
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