import axios from 'axios'

const BASE_URL = '/api/exercise'

export const fetchExercises = (params) => {
  return axios.get(`${BASE_URL}/admin/search`, { params })
}

export const createExercise = (data) => {
  return axios.post(`${BASE_URL}/create`, data)
}

export const updateExercise = (id, data) => {
  return axios.put(`${BASE_URL}/label/${id}`, data)
}

export const deleteExercise = (id) => {
  return axios.delete(`${BASE_URL}/${id}`)
}

export const getExercise = (id) => {
  return axios.get(`${BASE_URL}/${id}`)
} 