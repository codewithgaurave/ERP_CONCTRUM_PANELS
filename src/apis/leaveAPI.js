import axios from 'axios';
import apiRoutes from '../contants/api';

const API_URL = apiRoutes.leaves;

const leaveAPI = {
  // Get my leaves
  getMyLeaves: async () => {
    const response = await axios.get(`${API_URL}/my-leaves`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Get my and team leaves (for team leaders and HR)
  getMyAndTeamLeaves: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'All' && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_URL}/my-teams-leaves?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response;
  },

  // Update leave status (approve/reject)
  updateStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await axios.post(API_URL, leaveData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Get leave by ID
  getLeaveById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Update leave (for cancellation)
  updateLeave: async (id, updateData) => {
    const response = await axios.put(`${API_URL}/${id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  }
};

export { leaveAPI };
export default leaveAPI;