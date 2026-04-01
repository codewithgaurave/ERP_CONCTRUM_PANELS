// src/apis/officeLocationAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const officeLocationAPI = {
  // Create Office Location (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.officeLocations}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Office Locations without filters
  getAllWithoutFilters: () =>
    axios.get(`${apiRoutes.officeLocations}/without-filters`, {
      headers: getAuthHeader(),
    }),
  // Get all Office Locations with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.officeLocations}`, {
      params: {
        search: params.search || "",
        officeType: params.officeType || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // Get single Office Location by ID
  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.officeLocations}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Update Office Location (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.officeLocations}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Office Location (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.officeLocations}/${id}`, {
      headers: getAuthHeader(),
    }),
};

export default officeLocationAPI;