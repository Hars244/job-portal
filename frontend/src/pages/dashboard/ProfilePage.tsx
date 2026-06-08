import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Upload, X, Loader2, ArrowLeft, Wand2, Check } from 'lucide-react'
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

const SUGGESTED_SKILLS = [
  "React", "React Native", "Node.js", "MongoDB", "Python", 
  "Java", "TypeScript", "PostgreSQL", "AWS", "Docker"
]

const PHONE_CODES = [
  { code: '+91', label: 'India' },
  { code: '+1', label: 'USA/CA' },
  { code: '+44', label: 'UK' },
  { code: '+61', label: 'Australia' }
]

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

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const filteredSkills = SUGGESTED_SKILLS.filter(s => 
    s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  )

  const handleAIExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAIExtracting(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/users/extract-resume-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extractedData = res.data;

      if (extractedData.name) setValue('name', extractedData.name);
      if (extractedData.phone) setValue('phone', extractedData.phone);
      if (extractedData.phoneCode) setValue('phoneCode', extractedData.phoneCode);
      if (extractedData.bio) setValue('bio', extractedData.bio);
      if (extractedData.experience) setValue('experience', extractedData.experience);
      if (extractedData.education) setValue('education', extractedData.education);
      
      if (extractedData.skills?.length) {
        setSkills(prev => Array.from(new Set([...prev, ...extractedData.skills])));
      }
      
      toast.success('Successfully extracted details from resume!');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to analyze resume. Please try manually.');
    } finally {
      setIsAIExtracting(false);
      // Reset the input so the user can select the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await api.post('/users/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser({ resume: res.data.resume })
      toast.success('Resume uploaded successfully!')
    } catch {
      toast.error('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const combinedLocation = [data.country, data.state, data.city].filter(Boolean).join(', ')

      const res = await api.put('/users/profile', {
        ...data,
        location: combinedLocation,
        skills,
      })
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
      navigate(-1)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-gray-500 text-sm">Keep your profile up to date</p>
            </div>
          </div>
          
          {/* AI Auto-fill Button */}
          {user?.role === 'jobseeker' && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAIExtracting}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-70 font-medium text-sm"
              >
                {isAIExtracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isAIExtracting ? 'Extracting...' : 'Auto-fill from Resume'}
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf" 
                className="hidden" 
                onChange={handleAIExtract} 
              />
            </>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Avatar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Split Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <select 
                  {...register('phoneCode')}
                  className="w-1/3 sm:w-1/4 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {PHONE_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} {c.label}</option>
                  ))}
                </select>
                <input
                  {...register('phone')}
                  placeholder="904xx xxx61"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Split Location Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  {...register('country')}
                  placeholder="Country"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <input
                  {...register('state')}
                  placeholder="State/Region"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <input
                  {...register('city')}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Bio with Live Character Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Summary / Bio</label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Tell recruiters about yourself..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-gray-500">Maximum 500 characters</p>
                <p className={`text-xs font-medium ${bioValue.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {bioValue.length} / 500
                </p>
              </div>
              {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>}
            </div>
          </div>

          {/* Professional Info */}
          {user?.role === 'jobseeker' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                <h2 className="font-semibold text-gray-900 dark:text-white">Professional Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience</label>
                  <input
                    {...register('experience')}
                    placeholder="e.g. 3 years of full stack development"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Education</label>
                  <input
                    {...register('education')}
                    placeholder="e.g. B.Tech Computer Science, IIT Mumbai"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Skills Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
                  <div className="relative mb-3" ref={suggestionsRef}>
                    <div className="flex gap-2">
                      <input
                        value={skillInput}
                        onChange={e => {
                          setSkillInput(e.target.value)
                          setShowSuggestions(true)
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={e => { 
                          if (e.key === 'Enter') { 
                            e.preventDefault()
                            if (filteredSkills.length > 0) {
                              addSkill(filteredSkills[0])
                            } else {
                              addSkill(skillInput) 
                            }
                          } 
                        }}
                        placeholder="Type a skill..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(skillInput)}
                        className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                      >
                        Add
                      </button>
                    </div>

                    {showSuggestions && skillInput && filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredSkills.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Resume</h2>
                {user?.resume?.url ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400 text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" /> Resume uploaded
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.resume.originalName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Delete your resume?')) return
                          try {
                            await api.delete('/users/resume')
                            updateUser({ resume: undefined })
                            toast.success('Resume deleted!')
                          } catch {
                            toast.error('Failed to delete resume')
                          }
                        }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch(user.resume!.url)
                          const blob = await response.blob()
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = user.resume!.originalName || 'resume.pdf'
                          document.body.appendChild(a)
                          a.click()
                          window.URL.revokeObjectURL(url)
                          document.body.removeChild(a)
                        } catch {
                          toast.error('Download failed')
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition"
                    >
                      ⬇️ Download Resume
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="font-medium text-gray-700 dark:text-gray-300">Click to upload resume</p>
                          <p className="text-xs text-gray-500">PDF only, max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}