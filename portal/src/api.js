import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})

export const affectationsApi = {
  getAll: () => api.get('/affectations'),
  getByIncident: (id) => api.get(`/affectations/incident/${id}`),
  getIncidentsToAssign: () => api.get('/affectations/incidents/a-affecter'),
  create: (data) => api.post('/affectations', data),
  updateStatut: (id, s) => api.put(`/affectations/${id}/statut`, { statut: s }),
  cloturer: (id, data) => api.put(`/affectations/${id}/cloturer`, data),
}

export const usersApi = {
  getAll: () => api.get('/utilisateurs'),
}

export const equipesApi = {
  getAll: () => api.get('/equipes'),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
}

export const incidentsApi = {
  getAll: () => api.get('/incidents'),
  create: (data) => api.post('/incidents', data),
}
