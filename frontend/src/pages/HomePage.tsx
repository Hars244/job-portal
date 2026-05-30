import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Brain, FileText, MessageSquare, TrendingUp, Users, Building2, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const stats = [
  { label: 'Jobs Posted', value: '10,000+' },
  { label: 'Companies', value: '500+' },
  { label: 'Hired', value: '25,000+' },
  { label: 'Success Rate', value: '94%' },
]

const features = [
  {
    icon: Brain,
    title: 'AI Job Matching',
    description: 'Our AI analyzes your profile and skills to recommend the most relevant jobs for you.',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    description: 'Upload your resume and get an AI score with specific suggestions to improve it.',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    description: 'AI generates role-specific interview questions with expert tips to help you prepare.',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  },
  {
    icon: Zap,
    title: 'JD Generator',
    description: 'Recruiters can generate professional job descriptions in seconds using AI.',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  },
]

const jobTypes = [
  'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship', 'Freelance'
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="bg-white dark:bg-gray-950">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              AI-Powered Job Portal
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your Dream Job
              <span className="block text-blue-200">With AI Assistance</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              HireAI matches you with the perfect job using artificial intelligence.
              Get resume feedback, interview prep, and smart job recommendations — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-colors"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-colors"
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-8 py-4 rounded-xl transition-colors"
                  >
                    Browse Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Job Types */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {jobTypes.map((type) => (
              <Link
                key={type}
                to={`/jobs?jobType=${type.toLowerCase()}`}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
              >
                {type}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powered by Artificial Intelligence
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Every feature is designed to give you an unfair advantage in your job search
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">Get hired in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Users, title: 'Create Profile', desc: 'Sign up and build your professional profile with skills, experience and resume.' },
              { step: '02', icon: Brain, title: 'AI Matches You', desc: 'Our AI analyzes your profile and finds the best matching jobs for your skills.' },
              { step: '03', icon: TrendingUp, title: 'Get Hired', desc: 'Apply with one click, track your applications and land your dream job.' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-white">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-4xl font-bold mb-4">Ready to Find Your Next Role?</h2>
            <p className="text-blue-100 text-xl mb-8 max-w-xl mx-auto">
              Join thousands of professionals who found their dream job through HireAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-colors"
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-8 py-4 rounded-xl transition-colors"
              >
                <Briefcase className="w-5 h-5" /> Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}