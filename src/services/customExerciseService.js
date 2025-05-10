import axios from 'axios'

const BASE_URL = '/api/exercises/custom'

export const fetchCustomExercises = (params = {}) => {
  return axios.get(BASE_URL, { params })
}

export const deleteCustomExercise = (id) => {
  return axios.delete(`${BASE_URL}/${id}`)
}

export const getCustomExercise = (id) => {
  return axios.get(`${BASE_URL}/${id}`)
} 