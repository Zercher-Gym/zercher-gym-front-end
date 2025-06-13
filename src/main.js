// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/theme.css';

// import './assets/main.css'; // if you have any global styles

// Import the hasRole function
import { hasRole, hasAnyRole } from './services/userProfileService.js';

// Configure axios to automatically add JWT token to all requests
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('jwt');
  if (token) {
    // Log token info for debugging (without showing the full token for security)
    console.log('Using token in request:', token.substring(0, 20) + '...');
    
    // Add authorization header
    config.headers.Authorization = `Bearer ${token}`;
    
    // Check if the request is for an admin endpoint
    if (config.url && config.url.includes('/admin/')) {
      // Check if the user has admin role
      const hasAdminRole = hasAnyRole(['ROLE_ADMIN', 'ADMIN']);
      console.log('User has admin role:', hasAdminRole);
      
      if (!hasAdminRole) {
        console.warn('User does not have admin role, but is trying to access admin endpoint:', config.url);
      }
    }
  } else {
    console.warn('No JWT token found in sessionStorage');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle 401/403 responses globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data);
      // You might want to redirect to login page if token is invalid
      // router.push('/');
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);
app.use(router);
app.mount('#app');
