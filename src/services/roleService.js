import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Set exercise limit for a role
export const setRoleExerciseLimit = (roleId, exerciseLimit) => {
  const token = sessionStorage.getItem('jwt');
  return axios.put(`${baseURL}/api/role/limit/${roleId}`, { exerciseLimit }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Get current exercise limits for all roles
export const fetchRoleLimits = () => {
  const token = sessionStorage.getItem('jwt');
  return axios.get(`${baseURL}/api/role/limit`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
