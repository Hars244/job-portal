import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Briefcase, Bell, Sun, Moon, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useDarkMode } from '../../hooks/useDarkMode'
import api from '../../api/axios'
import { useSocket } from '../../hooks/useSocket'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'


export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  // Updated this to useThemeStore based on our previous fix (or keep useDarkMode if you didn't switch)
  const { isDark, toggle } = useDarkMode() 
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { }
    logout()
    navigate('/login')
  }
  useSocket()
  const queryClient = useQueryClient()
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications')
      return res.data
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#050816]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Added 'relative' here to anchor the absolutely positioned center nav */}
        <div className="flex items-center justify-between h-16 relative">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HireAI</span>
          </Link>

          {/* Desktop nav - Now perfectly centered using absolute positioning */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Browse Jobs
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen)
                      if (!notifOpen && notifData?.unreadCount > 0) {
                        markAllRead.mutate()
                      }
                    }}
                    className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifData?.unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {notifData.unreadCount > 9 ? '9+' : notifData.unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#050816] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {notifData?.unreadCount > 0 && (
                          <span className="text-xs text-blue-600 cursor-pointer hover:underline"
                            onClick={() => markAllRead.mutate()}>
                            Mark all read
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifData?.notifications?.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifData?.notifications?.map((notif: any) => (
                            <div
                              key={notif._id}
                              className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                              onClick={() => {
                                if (notif.link) window.location.href = notif.link
                                setNotifOpen(false)
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-lg">
                                  {notif.type === 'status' ? '📋' :
                                    notif.type === 'application' ? '📩' : '🔔'}
                                </span>
                                <div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      
                      <Link
                        to={user?.role === 'recruiter' ? '/dashboard/recruiter/profile' : '/dashboard/jobseeker/profile'}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        My Profile
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {
        menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
            <Link to="/jobs" className="block text-gray-700 dark:text-gray-200 font-medium" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 dark:text-gray-200 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 dark:text-gray-200 font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )
      }
    </nav >
  )
}