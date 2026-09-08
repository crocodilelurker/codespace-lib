import api from './axios'

export const getAccessMap = (docId) =>
  api.get(`/access/${docId}`)

export const addCollaborator = (docId, userid, role) =>
  api.post(`/access/${docId}/collaborators`, { userid, role })

export const removeCollaborator = (docId, userid) =>
  api.delete(`/access/${docId}/collaborators`, { data: { userid } })

export const updateCollaborator = (docId, userid, role) =>
  api.put(`/access/${docId}/collaborators`, { userid, role })
