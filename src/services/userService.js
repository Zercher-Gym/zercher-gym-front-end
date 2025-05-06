import axios from 'axios';

const USER_API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '' });
USER_API.interceptors.request.use(config => {
  const token = sessionStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function fetchUsers({
  page = 0,
  size = 10,
  username = '',
  email = '',
  id = '',
  enabled = '',
  locked = ''
}) {
  const params = { page, size };
  if (username) params.username = username;
  if (email) params.email = email;
  if (id) params.id = id;
  if (enabled !== '') params.enabled = enabled; // true / false
  if (locked !== '') params.locked = locked;

  return USER_API.get('/api/user/admin/search', { params });
}


export function updateUser(id, { enabled, locked }) {
  const payload = { enabled, locked };          
  return USER_API.patch(`/api/user/admin/${id}`, payload, {
    headers: { 'Content-Type': 'application/merge-patch+json' } 
  });
}

export function deleteUser(id) {
  return USER_API.delete(`/api/user/admin/${id}`);
}