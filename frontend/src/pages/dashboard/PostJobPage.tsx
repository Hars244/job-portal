import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(1, 'Add at least one requirement'),
  responsibilities: z.string().min(1, 'Add at least one responsibility'),
  skills: z.string().min(1, 'Add at least one skill'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  isRemote: z.string().optional(),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PostJobPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const generatedJD = location.state?.generatedJD
  const jdForm = location.state?.jdForm

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobType: 'full-time',
      experienceLevel: 'mid',
      isRemote: '',
    },
  })
  
  // Pre-fill from AI generated JD
  useEffect(() => {
    if (generatedJD && jdForm) {
      setValue('title', jdForm.title)
      setValue('description', generatedJD.description)
      setValue('requirements', generatedJD.requirements.join('\n'))
      setValue('responsibilities', generatedJD.responsibilities.join('\n'))
      setValue('skills', jdForm.skills)
      setValue('location', jdForm.location)
      setValue('jobType', jdForm.jobType)
      setValue('experienceLevel', jdForm.experienceLevel)
      toast.success('Form pre-filled with AI generated content!')
    }
  }, [generatedJD])

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/jobs', {
        title: data.title,
        description: data.description,
        requirements: data.requirements.split('\n').filter(Boolean),
        responsibilities: data.responsibilities.split('\n').filter(Boolean),
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        location: data.location,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        isRemote: data.isRemote === 'true',
        deadline: data.deadline || undefined,
        salary: {
          min: data.salaryMin ? Number(data.salaryMin) : undefined,
          max: data.salaryMax ? Number(data.salaryMax) : undefined,
          currency: 'INR',
          isVisible: true,
        },
      })
      toast.success('Job posted successfully!')
      navigate('/dashboard/recruiter')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    }
  }

  // Shared pristine input styling
  const inputClasses = "w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"
  const labelClasses = "block text-sm font-bold text-slate-950 dark:text-white mb-2"
  const cardClasses = "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 dark:text-white/50 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Post a Job</h1>
            <p className="mt-1 text-sm sm:text-base font-medium text-slate-500 dark:text-white/60">Fill in the details to attract the best candidates to your team.</p>
          </div>
        </div>

        {generatedJD && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 mb-8">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300 font-bold">
              Form successfully pre-filled with your AI generated job description!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Info */}
          <div className={`${cardClasses} space-y-6`}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Basic Information</h2>

            <div>
              <label className={labelClasses}>Job Title <span className="text-rose-500">*</span></label>
              <input
                {...register('title')}
                placeholder="e.g. Senior Full Stack Developer"
                className={inputClasses}
              />
              {errors.title && <p className="mt-2 text-sm font-bold text-rose-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Job Type <span className="text-rose-500">*</span></label>
                <select
                  {...register('jobType')}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(t => (
                    <option key={t} value={t} className="capitalize bg-white dark:bg-slate-900">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Experience Level <span className="text-rose-500">*</span></label>
                <select
                  {...register('experienceLevel')}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                    <option key={l} value={l} className="capitalize bg-white dark:bg-slate-900">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Location <span className="text-rose-500">*</span></label>
                <input
                  {...register('location')}
                  placeholder="e.g. Mumbai, India or Remote"
                  className={inputClasses}
                />
                {errors.location && <p className="mt-2 text-sm font-bold text-rose-500">{errors.location.message}</p>}
              </div>
              <div>
                <label className={labelClasses}>Application Deadline</label>
                <input
                  {...register('deadline')}
                  type="date"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input
                  {...register('isRemote')}
                  type="checkbox"
                  value="true"
                  className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 dark:bg-slate-800 dark:border-slate-600 cursor-pointer transition-colors"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                  This is a remote position
                </span>
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className={`${cardClasses} space-y-6`}>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Salary Range</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-white/50 mt-1">Optional, but highly recommended for better reach. (in INR)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Minimum Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 font-bold">₹</span>
                  <input
                    {...register('salaryMin')}
                    type="number"
                    placeholder="500000"
                    className={`${inputClasses} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Maximum Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 font-bold">₹</span>
                  <input
                    {...register('salaryMax')}
                    type="number"
                    placeholder="1500000"
                    className={`${inputClasses} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`${cardClasses} space-y-6`}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Job Details</h2>

            <div>
              <label className={labelClasses}>Job Description <span className="text-rose-500">*</span></label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                className={`${inputClasses} resize-none`}
              />
              {errors.description && <p className="mt-2 text-sm font-bold text-rose-500">{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Requirements <span className="text-rose-500">*</span> <span className="text-slate-400 dark:text-white/40 font-medium ml-1">(one per line)</span>
              </label>
              <textarea
                {...register('requirements')}
                rows={5}
                placeholder="3+ years of experience&#10;Strong knowledge of React&#10;Experience with Node.js"
                className={`${inputClasses} resize-none`}
              />
              {errors.requirements && <p className="mt-2 text-sm font-bold text-rose-500">{errors.requirements.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Responsibilities <span className="text-rose-500">*</span> <span className="text-slate-400 dark:text-white/40 font-medium ml-1">(one per line)</span>
              </label>
              <textarea
                {...register('responsibilities')}
                rows={5}
                placeholder="Build and maintain web applications&#10;Collaborate with the design team&#10;Write clean, maintainable code"
                className={`${inputClasses} resize-none`}
              />
              {errors.responsibilities && <p className="mt-2 text-sm font-bold text-rose-500">{errors.responsibilities.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Required Skills <span className="text-rose-500">*</span> <span className="text-slate-400 dark:text-white/40 font-medium ml-1">(comma separated)</span>
              </label>
              <input
                {...register('skills')}
                placeholder="React, Node.js, MongoDB, TypeScript"
                className={inputClasses}
              />
              {errors.skills && <p className="mt-2 text-sm font-bold text-rose-500">{errors.skills.message}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm dark:bg-white dark:text-slate-950 dark:hover:bg-white/90 mt-4"
          >
            {isSubmitting ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Publishing Job...</>
            ) : (
              <><Briefcase className="w-6 h-6" /> Post Job to Board</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}