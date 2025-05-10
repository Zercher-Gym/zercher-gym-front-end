import axios from 'axios';

// Create axios instance with base URL if needed
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
});

// Add a request interceptor to attach JWT token to all requests
API.interceptors.request.use(
  config => {
    // Get token from session storage
    const token = sessionStorage.getItem('jwt');
    
    // If token exists, add it to the authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      sessionStorage.removeItem('jwt');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default API;
