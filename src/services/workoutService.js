import axios from 'axios';

const BASE_URL = '/api/workout';

// List / search workouts (admin)
export const fetchWorkouts = (params) => {
  return axios.get(`${BASE_URL}/admin/search`, { params });
};

// Create a new workout (admin)
export const createWorkout = (data) => {
  return axios.post(`${BASE_URL}/admin/create`, data);
};

// Update workout base data (identifier / exercises list) (admin)
export const updateWorkout = (id, data) => {
  return axios.put(`${BASE_URL}/admin/${id}`, data);
};

// Update workout RO label (title/description)
export const updateWorkoutLabel = (id, data) => {
  console.log(`PUT /api/workout/label/${id}`, data);
  return axios.put(`${BASE_URL}/admin/label/${id}`, data);
};

// Delete workout (admin)
export const deleteWorkout = (id) => {
  return axios.delete(`${BASE_URL}/admin/${id}`);
};

// Get single workout details (non-admin endpoint assumed similar to exercise)
export const getWorkout = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};
