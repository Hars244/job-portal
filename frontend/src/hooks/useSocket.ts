import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

let socket: Socket | null = null

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      withCredentials: true,
    })

    socket.on('connect', () => {
      socket?.emit('register', user.id)
    })

    socket.on('notification', (notification: any) => {
      // Show toast
      toast(notification.message, {
        icon: notification.type === 'status' ? '📋' :
              notification.type === 'application' ? '📩' : '🔔',
        duration: 5000,
      })
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      socket?.disconnect()
      socket = null
    }
  }, [isAuthenticated, user?.id])

  return socket
}