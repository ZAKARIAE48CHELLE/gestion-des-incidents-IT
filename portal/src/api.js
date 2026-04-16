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
  getAll:  ()         => api.get('/utilisateurs'),
  getById: (id)       => api.get(`/utilisateurs/${id}`),
  create:  (data)     => api.post('/utilisateurs', data),
  update:  (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete:  (id)       => api.delete(`/utilisateurs/${id}`),
  getByEquipe: (equipeId) => api.get(`/utilisateurs/equipe/${equipeId}`),
}

export const equipesApi = {
  getAll:  ()         => api.get('/equipes'),
  getById: (id)       => api.get(`/equipes/${id}`),
  create:  (data)     => api.post('/equipes', data),
  update:  (id, data) => api.put(`/equipes/${id}`, data),
  delete:  (id)       => api.delete(`/equipes/${id}`),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
}

export const incidentsApi = {
  getAll: () => api.get('/incidents'),
  create: (data) => api.post('/incidents', data),
}

export const equipementsApi = {
  getAll: () => api.get('/equipements'),
  create: (data) => api.post('/equipements', data),
  update: (id, data) => api.put(`/equipements/${id}`, data),
  delete: (id) => api.delete(`/equipements/${id}`),
  getByStatut: (statut) => api.get(`/equipements/statut/${statut}`),
  getStats: () => api.get('/equipements/stats'),
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
}
