import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Briefcase, SlidersHorizontal, X, Building2, Clock, DollarSign, Bookmark } from 'lucide-react'
import api from '../../api/axios'
import type { Job } from '../../types'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance']
const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive']

function JobCard({ job }: { job: Job }) {
  const { isAuthenticated, user } = useAuthStore()
  const [saved, setSaved] = useState(() =>
    user?.savedJobs?.includes(job._id) || false
  )

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to save jobs')
      return
    }
    try {
      const res = await api.post(`/users/save-job/${job._id}`)
      setSaved(res.data.saved)
      toast.success(res.data.message)
    } catch {
      toast.error('Failed to save job')
    }
  }

  const formatSalary = (salary: Job['salary']) => {
    if (!salary.isVisible || (!salary.min && !salary.max)) return null
    const format = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`
    if (salary.min && salary.max) return `₹${format(salary.min)} - ₹${format(salary.max)}`
    if (salary.min) return `₹${format(salary.min)}+`
    return null
  }

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <Link to={`/jobs/${job._id}`} className="block">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/20 group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-8 h-8 object-contain rounded-md" />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-0.5">{job.company?.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`p-2.5 rounded-xl transition-all shrink-0 border ${saved
              ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
              : 'border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:border-white/10 dark:bg-transparent dark:text-white/40 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30'
              }`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full capitalize">
            <Briefcase className="w-3.5 h-3.5" /> {job.jobType}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full capitalize">
            {job.experienceLevel}
          </span>
          {job.isRemote && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full">
              Remote
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            {formatSalary(job.salary) && (
              <span className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                {formatSalary(job.salary)}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {timeAgo(job.createdAt)}
          </span>
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.slice(0, 4).map(skill => (
              <span key={skill} className="text-xs font-semibold bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 px-2.5 py-1 rounded-lg">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs font-semibold text-slate-400 dark:text-white/40 py-1">+{job.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function JobsPage() {
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])
  const [isRemote, setIsRemote] = useState(false)
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [page, setPage] = useState(1)

  const buildQuery = () => {
    const params: any = { page, limit: 10 }
    if (search) params.search = search
    if (location) params.location = location
    if (selectedJobTypes.length > 0) params.jobType = selectedJobTypes[0]
    if (selectedExperience.length > 0) params.experienceLevel = selectedExperience[0]
    if (isRemote) params.isRemote = true
    if (minSalary) params.minSalary = minSalary
    if (maxSalary) params.maxSalary = maxSalary
    return params
  }

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, location, selectedJobTypes, selectedExperience, isRemote, minSalary, maxSalary, page],
    queryFn: async () => {
      const res = await api.get('/jobs', { params: buildQuery() })
      return res.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setSelectedJobTypes([])
    setSelectedExperience([])
    setIsRemote(false)
    setMinSalary('')
    setMaxSalary('')
    setPage(1)
  }

  const hasFilters = search || location || selectedJobTypes.length || selectedExperience.length || isRemote || minSalary || maxSalary

  const inputClasses = "w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-16">
      {/* Search Header */}
      <div className="bg-white/80 dark:bg-[#050816]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, skills, or keywords..."
                className={inputClasses}
              />
            </div>
            <div className="relative hidden md:block">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location..."
                list="cities"
                className={`${inputClasses} w-48`}
              />
              <datalist id="cities">
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
                  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
                  'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
                  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Noida', 'Gurgaon',
                  'Coimbatore', 'Kochi', 'Remote'].map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border font-bold transition-all ${showFilters ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-4 block">Job Type</label>
                  <div className="space-y-3">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedJobTypes.includes(type)}
                          onChange={() => setSelectedJobTypes(prev =>
                            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                          )}
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium capitalize text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-4 block">Experience Level</label>
                  <div className="space-y-3">
                    {experienceLevels.map(level => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedExperience.includes(level)}
                          onChange={() => setSelectedExperience(prev =>
                            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                          )}
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium capitalize text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-4 block">Salary Range</label>
                  <div className="space-y-3">
                    {[
                      { label: 'Any Amount', min: '', max: '' },
                      { label: 'Under ₹3L', min: '', max: '300000' },
                      { label: '₹3L - ₹6L', min: '300000', max: '600000' },
                      { label: '₹6L - ₹12L', min: '600000', max: '1200000' },
                      { label: '₹12L - ₹20L', min: '1200000', max: '2000000' },
                      { label: '₹20L+', min: '2000000', max: '' },
                    ].map(range => (
                      <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="salary"
                          checked={minSalary === range.min && maxSalary === range.max}
                          onChange={() => { setMinSalary(range.min); setMaxSalary(range.max) }}
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-4 block">Work Mode</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isRemote}
                        onChange={e => setIsRemote(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">Remote only</span>
                    </label>
                  </div>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-8 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" /> Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-500 dark:text-white/60 font-bold uppercase tracking-wider text-sm">
            {isLoading ? 'Loading jobs...' : `${data?.pagination?.total || 0} jobs found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/[0.02] rounded-3xl p-6 border border-slate-200 dark:border-white/10 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                  <div className="flex-1 mt-2">
                    <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.jobs?.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300 dark:text-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 dark:text-white/60 font-medium">Try adjusting your search criteria or filters.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {data?.jobs?.map((job: Job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-600 dark:text-white/70 font-bold transition-all"
            >
              Previous
            </button>
            <div className="hidden sm:flex gap-2">
              {[...Array(data.pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2.5 rounded-xl border font-bold transition-all ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-600 dark:text-white/70 font-bold transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}