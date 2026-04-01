// src/apis/departmentAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const departmentAPI = {
  // Create Department (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.departments}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Departments with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.departments}`, {
      params: {
        search: params.search || "",
        status: params.status || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
        createdBy: params.createdBy || ""
      },
      headers: getAuthHeader(),
    }),

  // Get single Department by ID
  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.departments}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Update Department (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.departments}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Department (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.departments}/${id}`, {
      headers: getAuthHeader(),
    }),
};

export default departmentAPI;