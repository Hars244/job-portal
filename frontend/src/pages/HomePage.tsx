import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Sparkles, Cpu, FileSearch, MessageSquare, FileText } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const stats = [
  { label: 'Jobs Posted', value: '10,000+' },
  { label: 'Companies', value: '500+' },
  { label: 'Hired', value: '25,000+' },
  { label: 'Success Rate', value: '94%' },
]

const features = [
  {
    title: 'AI Job Matching',
    description: 'Surface relevant roles from your profile, skills, and preferences in one focused feed.',
    icon: Cpu,
    // Blue theme
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Resume Analyzer',
    description: 'Upload your resume and get clear suggestions to improve it before applying.',
    icon: FileSearch,
    // Indigo theme
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Interview Prep',
    description: 'Practice role-based questions and prepare with focused guidance.',
    icon: MessageSquare,
    // Violet theme
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    title: 'JD Generator',
    description: 'Create job descriptions faster with a clean recruiter workflow.',
    icon: FileText,
    // Emerald theme
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
]

const steps = [
  {
    step: '01',
    title: 'Create Profile',
    desc: 'Add your experience, skills, and resume in just a few minutes.',
  },
  {
    step: '02',
    title: 'Get Matched',
    desc: 'See roles that fit your background and preferences.',
  },
  {
    step: '03',
    title: 'Apply and Track',
    desc: 'Apply easily and manage every application in one place.',
  },
]

const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship', 'Freelance']

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      {/* Hero */}
      <section className="border-b border-slate-200 px-4 py-12 dark:border-white/10 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* 1. Added mx-auto and text-center to the main content wrapper */}
          <div className="mx-auto max-w-4xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
              <Sparkles className="h-4 w-4" />
              AI powered hiring platform
            </div>

            {/* 2. Added mx-auto to center the max-width text block */}
            <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Find your next role faster.
            </h1>

            {/* 3. Added mx-auto here as well */}
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-white/60 sm:text-xl">
              Discover opportunities, improve your resume, and manage applications in one place.
            </p>

            {/* 4. Added justify-center to align the buttons in the middle */}
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                  >
                    Browse Jobs
                  </Link>
                </>
              )}
            </div>

            {/* 5. Added text-left so the text inside the stat cards stays aligned correctly */}
            <div className="mt-12 grid grid-cols-2 gap-4 text-left lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-white/45">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Job type pills */}
      <section className="border-b border-slate-200 bg-white px-4 py-8 dark:border-white/10 dark:bg-[#050816] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {jobTypes.map((type) => (
              <Link
                key={type}
                to={`/jobs?jobType=${type.toLowerCase()}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.06]"
              >
                {type}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-14 dark:border-white/10 dark:bg-[#050816] sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Everything you need, in one clean layout.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-white/60">
              Simple sections, consistent cards, and enough information density to feel useful without looking busy.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
  {features.map((feature) => (
    <div
      key={feature.title}
      className="min-h-[170px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
    >
      {/* 🎨 SEMANTIC STYLING */}
      <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.iconBg}`}>
        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
      </div>
      
      <h3 className="text-xl font-bold text-slate-950 dark:text-white">
        {feature.title}
      </h3>
      <p className="mt-3 leading-7 text-slate-600 dark:text-white/55">
        {feature.description}
      </p>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200 bg-white px-4 py-14 dark:border-white/10 dark:bg-[#050816] sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              How it works.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="text-sm font-bold tracking-[0.24em] text-slate-400 dark:text-white/35">
                  {step.step}
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm leading-7 text-slate-600 dark:text-white/55">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:px-10 sm:py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.05]">
              <Briefcase className="h-5 w-5 text-slate-700 dark:text-white/80" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Ready to get hired?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-white/60">
              Start using a platform that feels clear, balanced, and easy to scan.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
