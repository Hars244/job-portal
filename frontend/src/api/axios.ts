import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// 🟢 NEW: Request Interceptor - This attaches the Access Token to every request
api.interceptors.request.use(
  (config) => {
    // Grab the token from Zustand state
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔵 EXISTING: Response Interceptor - Handles 401s and Refreshes Tokens
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
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Extract the NEW token from the backend response
        const newAccessToken = refreshResponse.data.accessToken;
        
        // Save the new token to Zustand so the rest of the app can use it
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
           useAuthStore.getState().setAuth(currentUser, newAccessToken);
        }

        // Update the failed request with the NEW token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
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