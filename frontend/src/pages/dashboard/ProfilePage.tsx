import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Upload, X, Loader2, ArrowLeft, Wand2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneCode: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SUGGESTED_SKILLS = ["React", "React Native", "Node.js", "MongoDB", "Python", "Java", "TypeScript", "PostgreSQL", "AWS", "Docker"]
const PHONE_CODES = [{ code: '+91', label: 'India' }, { code: '+1', label: 'USA/CA' }, { code: '+44', label: 'UK' }, { code: '+61', label: 'Australia' }]

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(user?.skills || [])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAIExtracting, setIsAIExtracting] = useState(false)
  
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const existingLocation = user?.location?.split(', ') || []

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phoneCode: '+91',
      phone: user?.phone || '',
      country: existingLocation[0] || '',
      state: existingLocation[1] || '',
      city: existingLocation[2] || '',
      bio: user?.bio || '',
      experience: user?.experience || '',
      education: user?.education || '',
    },
  })

  const bioValue = watch('bio') || ''

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
      setSkillInput('')
      setShowSuggestions(false)
    }
  }

  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill))
  const filteredSkills = SUGGESTED_SKILLS.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s))

  const handleAIExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAIExtracting(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/users/extract-resume-data', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const extractedData = res.data;
      if (extractedData.name) setValue('name', extractedData.name);
      if (extractedData.phone) setValue('phone', extractedData.phone);
      if (extractedData.bio) setValue('bio', extractedData.bio);
      if (extractedData.skills?.length) setSkills(prev => Array.from(new Set([...prev, ...extractedData.skills])));
      toast.success('Successfully extracted details from resume!');
    } catch {
      toast.error('Failed to analyze resume.');
    } finally {
      setIsAIExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await api.post('/users/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser({ resume: res.data.resume })
      toast.success('Resume uploaded!')
    } catch { toast.error('Failed to upload') } finally { setUploading(false) }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const location = [data.country, data.state, data.city].filter(Boolean).join(', ')
      const res = await api.put('/users/profile', { ...data, location, skills })
      updateUser(res.data.user)
      toast.success('Profile updated!')
      navigate(-1)
    } catch { toast.error('Failed to update') }
  }

  const inputClasses = "w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:bg-white/[0.05] dark:focus:ring-blue-400/10"
  const labelClasses = "block text-sm font-bold text-slate-950 dark:text-white mb-2"
  const cardClasses = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 dark:text-white/50 dark:hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
              <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Edit Profile</h1>
              <p className="mt-1 font-medium text-slate-500 dark:text-white/60">Keep your professional details updated.</p>
            </div>
          </div>
          {user?.role === 'jobseeker' && (
            <button onClick={() => fileInputRef.current?.click()} disabled={isAIExtracting} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-sm">
              {isAIExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isAIExtracting ? 'Extracting...' : 'Auto-fill with AI'}
            </button>
          )}
          <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={handleAIExtract} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className={cardClasses}>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-slate-950 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-950 text-3xl font-black">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">{user?.name}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-white/60 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className={cardClasses}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Personal Information</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Full Name *</label>
                <input {...register('name')} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Phone Number</label>
                <div className="flex gap-3">
                  <select {...register('phoneCode')} className={`${inputClasses} w-1/3 sm:w-1/4`}>
                    {PHONE_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                  <input {...register('phone')} className={inputClasses} placeholder="904xx xxx61" />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Location</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input {...register('country')} placeholder="Country" className={inputClasses} />
                  <input {...register('state')} placeholder="State" className={inputClasses} />
                  <input {...register('city')} placeholder="City" className={inputClasses} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Summary / Bio</label>
                <textarea {...register('bio')} rows={4} className={`${inputClasses} resize-none`} />
                <p className="text-xs font-medium text-slate-400 mt-2 text-right">{bioValue.length} / 500</p>
              </div>
            </div>
          </div>

          {user?.role === 'jobseeker' && (
            <div className={cardClasses}>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Professional Details</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Experience</label>
                  <input {...register('experience')} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Education</label>
                  <input {...register('education')} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Skills</label>
                  <div className="flex gap-3 mb-3">
                    <input value={skillInput} onChange={e => { setSkillInput(e.target.value); setShowSuggestions(true) }} className={inputClasses} placeholder="Type a skill..." />
                    <button type="button" onClick={() => addSkill(skillInput)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold">
                        {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-4 h-4" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={cardClasses}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Resume</h2>
            {user?.resume?.url ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                <span className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">Resume uploaded ✓</span>
                <button type="button" onClick={async () => { await api.delete('/users/resume'); updateUser({ resume: undefined }); toast.success('Deleted!') }} className="text-rose-500 font-bold text-sm">Delete</button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-bold">Click to upload resume</p>
                <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all dark:bg-white dark:text-slate-950">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}