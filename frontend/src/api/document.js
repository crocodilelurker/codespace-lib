import api from './axios'

export const getMyDocs = () =>
  api.get('/document/')

export const createDoc = (name, publicAccess = false) =>
  api.post('/document/create', { name, publicAccess })

export const getDocById = (id) =>
  api.get(`/document/${id}`)

export const updateDoc = (id, payload) =>
  api.put(`/document/${id}`, payload)

export const deleteDoc = (id) =>
  api.delete(`/document/${id}`)
