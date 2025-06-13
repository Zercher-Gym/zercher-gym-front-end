import axios from 'axios'

const BASE_URL = '/api/exercise/custom/admin'

export const fetchCustomExercises = (params = {}) => {
  return axios.get('/api/exercise/custom', { params })
}

export const deleteCustomExercise = (id) => {
  return axios.delete(`${BASE_URL}/${id}`)
}

export const getCustomExercise = (id) => {
  return axios.get(`${BASE_URL}/${id}`)
} 