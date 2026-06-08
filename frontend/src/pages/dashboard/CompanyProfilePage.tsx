import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Company name required'),
  description: z.string().optional(),
  website: z.string().optional(),
  location: z.string().min(2, 'Location required'),
  industry: z.string().min(2, 'Industry required'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  founded: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CompanyProfilePage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { size: '51-200' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/companies', {
        ...data,
        founded: data.founded ? Number(data.founded) : undefined,
      })
      updateUser({ company: res.data.company })
      toast.success('Company profile created!')
      navigate('/dashboard/recruiter')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create company')
    }
  }

  // Shared input styling for pristine consistency
  const inputClasses = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"
  const labelClasses = "block text-sm font-semibold text-slate-950 dark:text-white mb-2"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Create Company Profile
            </h1>
            <p className="mt-1 text-slate-600 dark:text-white/60">
              Set up your company details to start posting jobs.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.02] space-y-6">

            <div>
              <label className={labelClasses}>Company Name *</label>
              <input {...register('name')} placeholder="e.g. Tech Corp India" className={inputClasses} />
              {errors.name && <p className="mt-2 text-sm font-medium text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Industry *</label>
                <input {...register('industry')} placeholder="e.g. Technology" className={inputClasses} />
                {errors.industry && <p className="mt-2 text-sm font-medium text-red-500">{errors.industry.message}</p>}
              </div>
              <div>
                <label className={labelClasses}>Location *</label>
                <input {...register('location')} placeholder="e.g. Mumbai, India" className={inputClasses} />
                {errors.location && <p className="mt-2 text-sm font-medium text-red-500">{errors.location.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Company Size *</label>
                <select {...register('size')} className={`${inputClasses} appearance-none cursor-pointer`}>
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(s => (
                    <option key={s} value={s} className="bg-white dark:bg-gray-900">{s} employees</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Founded Year</label>
                <input {...register('founded')} placeholder="e.g. 2010" type="number" className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Website</label>
              <input {...register('website')} placeholder="https://yourcompany.com" className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea 
                {...register('description')} 
                rows={4} 
                placeholder="Tell candidates about your company's mission and culture..."
                className={`${inputClasses} resize-none`} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating Profile...</>
            ) : (
              'Create Company Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}