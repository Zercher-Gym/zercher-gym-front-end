import axios from 'axios'
import { hasRole, hasAnyRole } from './userProfileService'

const BASE_URL = '/api/exercise'
const ADMIN_URL = `${BASE_URL}/admin`

export const fetchExercises = (params) => {
  const url = `${ADMIN_URL}/search`;
  console.log('Fetching exercises from URL:', url, 'with params:', params);
  
  return axios.get(url, { params })
    .then(response => {
      console.log('Raw exercise list response:', response);
      
      // Verificu0103 structura ru0103spunsului pentru debugging
      if (response.data) {
        if (response.data.content) {
          console.log('Found exercises in response.data.content:', response.data.content.length, 'items');
        } else if (Array.isArray(response.data)) {
          console.log('Response data is an array with', response.data.length, 'items');
        } else {
          console.log('Response data structure:', Object.keys(response.data));
        }
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error fetching exercises:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      throw error;
    });
}

export const createExercise = (data) => {
  console.log('Creating exercise with data:', JSON.stringify(data))
  
  // Folosim endpoint-ul exact din Swagger: POST /api/exercise/create
  const url = `${ADMIN_URL}/create`;
  console.log('Posting to URL:', url);
  
  return axios.post(url, data)
    .then(response => {
      console.log('Exercise created successfully:', response.data)
      return response
    })
    .catch(error => {
      console.error('Error creating exercise:', error)
      console.error('Error response:', error.response ? error.response.data : 'No response data')
      console.error('Request payload that caused the error:', data)
      
      // If we get a 403 Forbidden, try to check the token
      if (error.response && error.response.status === 403) {
        const token = sessionStorage.getItem('jwt');
        if (token) {
          try {
            // Try to decode the JWT to see if it has the right roles
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            console.log('Token data:', tokenData);
            // Check if the token has expired
            if (tokenData.exp && tokenData.exp * 1000 < Date.now()) {
              console.error('Token has expired!');
            }
            // Check for roles
            if (tokenData.roles) {
              console.log('User roles:', tokenData.roles);
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
      }
      
      throw error
    })
}

export const updateExercise = (id, data) => {
  console.log(`Updating exercise with ID: ${id}`)
  console.log('Update payload:', JSON.stringify(data))
  
  // Check if the ID is valid
  if (id === undefined || id === null) {
    console.error('Cannot update exercise: ID is undefined or null');
    return Promise.reject(new Error('Exercise ID is required for update'));
  }
  
  // Extract the numeric ID from the exercise object
  let numericId = id;
  
  // If we have a complete object, try to extract the numeric ID
  if (typeof id === 'object' && id !== null) {
    numericId = id.id || id.exerciseId;
    console.log(`Extracted numeric ID: ${numericId} from object`);
  } else if (typeof id === 'string' && id.includes('-')) {
    // If the ID appears to be a UUID, try to find the associated numeric ID
    console.log(`ID appears to be a UUID: ${id}, need to find numeric ID`);
    // Here we should have logic to find the numeric ID corresponding to the UUID
    // For now we'll use the ID as is, but it will probably cause an error
  }
  
  // Check again if we have a valid ID after extraction
  if (numericId === undefined || numericId === null) {
    console.error('Cannot update exercise: Could not extract a valid ID');
    return Promise.reject(new Error('Could not extract a valid exercise ID for update'));
  }
  
  // According to Swagger, the payload must contain only title and description
  const simplifiedPayload = {
    title: data.title,
    description: data.description
  };
  
  // Use the correct endpoint from Swagger: /api/exercise/admin/label/{id}
  // Where {id} is the numeric ID of the exercise
  const url = `${BASE_URL}/admin/label/${numericId}`;
  console.log(`Using endpoint: ${url} with payload:`, JSON.stringify(simplifiedPayload));
  
  return axios.put(url, simplifiedPayload)
    .then(response => {
      console.log('Exercise updated successfully:', response.data)
      return response
    })
    .catch(error => {
      console.error('Error updating exercise:', error)
      console.error('Error response:', error.response ? error.response.data : 'No response data')
      console.error('Request payload that caused the error:', simplifiedPayload)
      throw error
    })
}

export const deleteExercise = (id) => {
  return axios.delete(`${ADMIN_URL}/${id}`)
}

export const getExercise = (id) => {
  const url = `${BASE_URL}/${id}`;
  console.log(`Getting exercise with ID: ${id} from URL: ${url}`);
  return axios.get(url);
}

// Public search (non-admin) for exercise list used in workout modal
export const searchExercises = (params) => {
  return axios.get(`${ADMIN_URL}/search`, { params });
};