import api from './api';
import apiRoutes from '../contants/api';

const assetCategoryAPI = {
  // Get all asset categories
  getAll: (params = {}) => api.get('/asset-categories', { params }),
  
  // Get asset category by ID
  getById: (id) => api.get(`/asset-categories/${id}`),
  
  // Create new asset category
  create: (data) => api.post('/asset-categories', data),
  
  // Update asset category
  update: (id, data) => api.put(`/asset-categories/${id}`, data),
  
  // Toggle asset category status
  toggleStatus: (id) => api.patch(`/asset-categories/${id}/toggle`),
  
  // Delete asset category
  delete: (id) => api.delete(`/asset-categories/${id}`)
};

export default assetCategoryAPI;