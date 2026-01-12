import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? (import.meta.env.VITE_APP_API_URL || 'https://issuex-server.onrender.com') // Use Env var first
    : 'http://localhost:5000',
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging for development (Reduced verbosity)
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('API Request:', {
    //     method: config.method?.toUpperCase(),
    //     url: config.url,
    //     baseURL: config.baseURL,
    //     params: config.params,
    //     data: config.data,
    //     // headers: config.headers // Commented out to avoid clutter and potential circular refs
    //   });
    // }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and debug logging
api.interceptors.response.use(
  (response) => {
    // Debug logging for development
    // Debug logging for development (Reduced verbosity)
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('API Response:', {
    //     status: response.status,
    //     url: response.config.url,
    //     data: response.data
    //   });
    // }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error or server unavailable');
      // Don't redirect for network errors
      return Promise.reject({
        ...error,
        code: 'NETWORK_ERROR',
        message: 'Server unavailable'
      });
    }

    // Only handle 401 errors if we're not already on the login page
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Ignore "User not found" errors (handling registration flow where user exists in Firebase but not yet in MongoDB)
      if (error.response?.data?.message?.includes('User not found')) {
        return Promise.reject(error);
      }

      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use a flag to prevent multiple redirects
      if (!window.isRedirecting) {
        window.isRedirecting = true;
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Add a method to check if the server is available
api.checkServerHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data.success === true;
  } catch (error) {
    return false;
  }
};

export default api;