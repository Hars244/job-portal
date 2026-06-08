import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { TrendingUp, Users, Eye, Briefcase, Award, Loader2 } from 'lucide-react'
import api from '../../api/axios'

const COLORS = ['#f59e0b', '#2563eb', '#7c3aed', '#dc2626', '#059669']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/jobs/analytics/overview')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050816] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const { stats, statusBreakdown, applicationsOverTime, topJobs } = data || {}

  // Fill missing dates in last 7 days
  const filledDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const found = applicationsOverTime?.find((a: any) => a.date === dateStr)
    return { date: dateStr.slice(5), applications: found?.applications || 0 }
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Analytics Dashboard 📊
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-white/60">
            Track your hiring performance and application trends.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Applications', value: stats?.totalApplications || 0, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Hired', value: stats?.hiredCount || 0, icon: Award, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
            { label: 'Hiring Rate', value: `${stats?.hiringRate || 0}%`, icon: TrendingUp, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
          ].map(stat => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Applications over time */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Applications — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={filledDates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Application Status</h3>
            {statusBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusBreakdown.map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-4">
                  {statusBreakdown.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium text-slate-600 dark:text-white/70 capitalize">
                          {STATUS_LABELS[item.name] || item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-950 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-white/40">
                <Users className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top performing jobs */}
        {topJobs?.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Top Performing Jobs</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topJobs} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="title" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="applications" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Applications" barSize={32} />
                <Bar dataKey="views" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Views" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}