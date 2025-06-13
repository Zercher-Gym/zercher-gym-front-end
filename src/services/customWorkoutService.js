import axios from 'axios';

// Base endpoint for admin access to user-defined (custom) workouts.
// Updated according to new backend spec (see Swagger screenshot):
//   LIST           GET  /api/workout/custom          (with paging/filters)
//   DETAILS        GET  /api/workout/custom/{id}
//   CREATE         POST /api/workout/custom/create
//   UPDATE         PUT  /api/workout/custom/{id}
//   DELETE         DELETE /api/workout/custom/{id}
const LIST_URL = '/api/workout/custom';
const DETAIL_URL = '/api/workout/custom'; // same as list plus /{id}
const CREATE_URL = '/api/workout/custom/create';
const UPDATE_URL = '/api/workout/custom';

/**
 * Fetch paginated / filtered list of custom workouts.
 * @param {Object} params optional paging & filter parameters
 */
export const fetchCustomWorkouts = (params = {}) => {
  return axios.get(LIST_URL, { params });
};

/**
 * Delete a custom workout by its id (UUID).
 */
export const deleteCustomWorkout = (id) => {
  return axios.delete(`${DETAIL_URL}/${id}`);
};

/**
 * Get a single custom workout (if you later need an edit view).
 */
export const getCustomWorkout = (id) => {
  return axios.get(`${DETAIL_URL}/${id}`);
};

/**
 * Create a new custom workout.
 * @param {Object} payload the workout payload
 */
export const createCustomWorkout = (payload) => {
  return axios.post(CREATE_URL, payload);
};

/**
 * Update an existing custom workout.
 * @param {string|number} id identifier/uuid of the workout
 * @param {Object} payload update payload
 */
export const updateCustomWorkout = (id, payload) => {
  return axios.put(`${UPDATE_URL}/${id}`, payload);
};
