import api from './api';

const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (params = {}) => api.get('/tasks', { params }),
  getMyTasks: (params = {}) => api.get('/tasks/my', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.put(`/tasks/${id}/status`, data),
  reviewTask: (id, data) => api.put(`/tasks/${id}/review`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  restoreTask: (id) => api.patch(`/tasks/${id}`, {}),
  getStats: () => api.get('/tasks/stats'),
  getAssignableEmployees: () => api.get('/tasks/assignable-employees'),
  getDeadlineAlerts: () => api.get('/tasks/alerts/deadline'),
};

export default taskAPI;
