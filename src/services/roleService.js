import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Set exercise and workout limits for a role
export const setRoleExerciseLimit = (roleId, exerciseLimit, workoutLimit) => {
  const token = sessionStorage.getItem('jwt');
  return axios.put(`${baseURL}/api/role/admin/limit/${roleId}`, { exerciseLimit, workoutLimit }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Get current exercise limits for all roles
export const fetchRoleLimits = () => {
  const token = sessionStorage.getItem('jwt');
  return axios.get(`${baseURL}/api/role/admin/limit`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
