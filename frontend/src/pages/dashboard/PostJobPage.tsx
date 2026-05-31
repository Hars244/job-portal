import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Loader2, ArrowLeft } from 'lucide-react'
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Job</h1>
                        <p className="text-gray-500 text-sm">Fill in the details to attract the best candidates</p>
                    </div>
                </div>

                {generatedJD && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                            ✨ Form pre-filled with AI generated job description
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title *</label>
                            <input
                                {...register('title')}
                                placeholder="e.g. Full Stack Developer"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Type *</label>
                                <select
                                    {...register('jobType')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                >
                                    {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(t => (
                                        <option key={t} value={t} className="capitalize">{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience Level *</label>
                                <select
                                    {...register('experienceLevel')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                >
                                    {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                                        <option key={l} value={l} className="capitalize">{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
                                <input
                                    {...register('location')}
                                    placeholder="e.g. Mumbai, India"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Deadline</label>
                                <input
                                    {...register('deadline')}
                                    type="date"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                {...register('isRemote')}
                                type="checkbox"
                                id="isRemote"
                                value="true"
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="isRemote" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                This is a remote position
                            </label>
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Salary Range (INR)</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Minimum</label>
                                <input
                                    {...register('salaryMin')}
                                    type="number"
                                    placeholder="e.g. 500000"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Maximum</label>
                                <input
                                    {...register('salaryMax')}
                                    type="number"
                                    placeholder="e.g. 1500000"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Job Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Description *</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Requirements * <span className="text-gray-400 font-normal">(one per line)</span>
                            </label>
                            <textarea
                                {...register('requirements')}
                                rows={4}
                                placeholder="3+ years of experience&#10;Strong knowledge of React&#10;Experience with Node.js"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                            {errors.requirements && <p className="mt-1 text-sm text-red-500">{errors.requirements.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Responsibilities * <span className="text-gray-400 font-normal">(one per line)</span>
                            </label>
                            <textarea
                                {...register('responsibilities')}
                                rows={4}
                                placeholder="Build and maintain web applications&#10;Collaborate with the design team&#10;Write clean, maintainable code"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                            {errors.responsibilities && <p className="mt-1 text-sm text-red-500">{errors.responsibilities.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Required Skills * <span className="text-gray-400 font-normal">(comma separated)</span>
                            </label>
                            <input
                                {...register('skills')}
                                placeholder="React, Node.js, MongoDB, TypeScript"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            {errors.skills && <p className="mt-1 text-sm text-red-500">{errors.skills.message}</p>}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Posting Job...</>
                        ) : (
                            <><Briefcase className="w-5 h-5" /> Post Job</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}