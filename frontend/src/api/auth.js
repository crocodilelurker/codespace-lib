import api from './axios'

export const signup = (name, email, phoneNumber, password) =>
  api.post('/auth/signup', { name, email, phoneNumber, password })

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const refresh = (token) =>
  api.post('/auth/refresh', { token })

export const getUserById = (id) =>
  api.get(`/auth/user/${id}`)
