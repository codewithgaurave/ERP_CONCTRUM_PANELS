import axios from 'axios';
import apiRoutes from '../contants/api';

const payrollAPI = {
  // Get all payrolls with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${apiRoutes.payroll}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response;
  },

  // Get HR team payrolls (specific for HR managers)
  getHRTeamPayrolls: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${apiRoutes.payroll}/team/hr?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response;
  },

  // Get all payrolls (for employees to see their own)
  getAllPayrolls: async () => {
    const response = await axios.get(apiRoutes.payroll, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Get payroll by ID
  getById: async (id) => {
    const response = await axios.get(`${apiRoutes.payroll}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response;
  },

  // Get payroll by ID (legacy method)
  getPayrollById: async (id) => {
    const response = await axios.get(`${apiRoutes.payroll}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Create payroll
  create: async (payrollData) => {
    const response = await axios.post(apiRoutes.payroll, payrollData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Update payroll
  update: async (id, payrollData) => {
    const response = await axios.put(`${apiRoutes.payroll}/${id}`, payrollData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Delete payroll
  delete: async (id) => {
    const response = await axios.delete(`${apiRoutes.payroll}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  },

  // Generate payroll for all employees
  generateForAll: async (data) => {
    const response = await axios.post(`${apiRoutes.payroll}/generate-all`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
      }
    });
    return response.data;
  }
};

export { payrollAPI };
export default payrollAPI;