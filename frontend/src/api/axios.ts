import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Ensure we don't try to refresh if the refresh call ITSELF is what failed
      if (originalRequest.url === '/auth/refresh') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If refresh succeeds, retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // 🛑 THE LOOP BREAKER: If refresh fails, log out and redirect safely
        useAuthStore.getState().logout(); 
        
        // Only redirect if we aren't already on the login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;