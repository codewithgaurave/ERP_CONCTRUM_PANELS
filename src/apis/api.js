import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_API
  ? `${import.meta.env.VITE_BASE_API}/api`
  : '/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;