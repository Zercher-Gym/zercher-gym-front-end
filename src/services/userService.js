// src/services/userService.js
import axios from 'axios';

const USER_API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '' });
USER_API.interceptors.request.use(config => {
  const token = sessionStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function fetchUsers({ page=0, size=10, username='', email='' }) {
  return USER_API.get('/api/user/admin/search', { params: { page, size, username, email } });
}

export function updateUser(id, payload) {
  return USER_API.patch(`/api/user/admin/${id}`, payload);
}

export function deleteUser(id) {
  return USER_API.delete(`/api/user/admin/${id}`);
}