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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard 📊</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your hiring performance</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Total Applications', value: stats?.totalApplications || 0, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
            { label: 'Hired', value: stats?.hiredCount || 0, icon: Award, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Hiring Rate', value: `${stats?.hiringRate || 0}%`, icon: TrendingUp, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Applications over time */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Applications — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filledDates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Application Status</h3>
            {statusBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusBreakdown.map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {statusBreakdown.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {STATUS_LABELS[item.name] || item.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Users className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top performing jobs */}
        {topJobs?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Top Performing Jobs</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topJobs} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Bar dataKey="applications" fill="#2563eb" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="views" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}