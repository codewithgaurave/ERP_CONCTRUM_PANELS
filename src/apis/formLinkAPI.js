import axios from 'axios';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('ERP-token')}`
});

const BASE = `${import.meta.env.VITE_BASE_API}/${import.meta.env.VITE_API_PREFIX || 'api'}/employee-form-links`;

const formLinkAPI = {
  // HR
  create: (data) => axios.post(BASE, data, { headers: getAuthHeader() }),
  update: (id, data) => axios.put(`${BASE}/${id}`, data, { headers: getAuthHeader() }),
  duplicate: (id) => axios.post(`${BASE}/${id}/duplicate`, {}, { headers: getAuthHeader() }),
  getAll: () => axios.get(BASE, { headers: getAuthHeader() }),
  getById: (id) => axios.get(`${BASE}/${id}`, { headers: getAuthHeader() }),
  toggle: (id) => axios.patch(`${BASE}/${id}/toggle`, {}, { headers: getAuthHeader() }),
  remove: (id) => axios.delete(`${BASE}/${id}`, { headers: getAuthHeader() }),
  updateSubmissionStatus: (id, submissionId, status) =>
    axios.patch(`${BASE}/${id}/submissions/${submissionId}/status`, { status }, { headers: getAuthHeader() }),

  // Public (no auth) - supports file uploads via FormData
  getPublicForm: (token) => axios.get(`${BASE}/public/${token}`),
  submitPublicForm: (token, formData) =>
    axios.post(`${BASE}/public/${token}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default formLinkAPI;
