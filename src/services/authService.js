import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''  
});

export function signIn({ username, password }) {
  return API
    .post('/api/auth/admin/signin', { username, password })  
    .then(resp => {
      return resp;
    })
    .catch(error => {
      console.error('Auth error:', error);
      throw error;
    });
}
