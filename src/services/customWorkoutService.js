import axios from 'axios';

// Base endpoint for user-defined (custom) workouts.
// Assumes backend follows similar pattern to custom exercises:
//   GET  /api/workout/custom        -> list & search
//   GET  /api/workout/custom/{id}   -> single workout details
//   DELETE /api/workout/custom/{id} -> delete
// Adjust BASE_URL if your backend path differs.
const BASE_URL = '/api/workout/custom';

/**
 * Fetch paginated / filtered list of custom workouts.
 * @param {Object} params optional paging & filter parameters
 */
export const fetchCustomWorkouts = (params = {}) => {
  return axios.get(BASE_URL, { params });
};

/**
 * Delete a custom workout by its id (UUID).
 */
export const deleteCustomWorkout = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

/**
 * Get a single custom workout (if you later need an edit view).
 */
export const getCustomWorkout = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};
