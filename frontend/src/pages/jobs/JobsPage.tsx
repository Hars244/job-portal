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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Company logo */}
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-8 h-8 object-contain" />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{job.company?.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${saved
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-full capitalize">
            <Briefcase className="w-3 h-3" /> {job.jobType}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 px-3 py-1 rounded-full capitalize">
            {job.experienceLevel}
          </span>
          {job.isRemote && (
            <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-3 py-1 rounded-full">
              Remote
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {formatSalary(job.salary) && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                {formatSalary(job.salary)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(job.createdAt)}
          </span>
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map(skill => (
              <span key={skill} className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '')
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '')
  const [isRemote, setIsRemote] = useState(searchParams.get('isRemote') === 'true')
  const [page, setPage] = useState(1)

  const buildQuery = () => {
    const params: any = { page, limit: 10 }
    if (search) params.search = search
    if (location) params.location = location
    if (jobType) params.jobType = jobType
    if (experienceLevel) params.experienceLevel = experienceLevel
    if (isRemote) params.isRemote = true
    return params
  }

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, location, jobType, experienceLevel, isRemote, page],
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
    setJobType('')
    setExperienceLevel('')
    setIsRemote(false)
    setPage(1)
  }

  const hasFilters = search || location || jobType || experienceLevel || isRemote

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Search header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, skills, or keywords..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="relative hidden md:block">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-48 pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${showFilters ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setJobType(jobType === type ? '' : type)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${jobType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Experience</label>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(experienceLevel === level ? '' : level)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${experienceLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={e => setIsRemote(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Remote only</span>
                </label>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 ml-auto"
                >
                  <X className="w-4 h-4" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${data?.pagination?.total || 0} jobs found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.jobs?.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {data?.jobs?.map((job: Job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Previous
            </button>
            {[...Array(data.pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg border transition ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}