// src/apis/designationAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const designationAPI = {
  // Create Designation (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.designations}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Designations with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.designations}`, {
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

  // Get single Designation by ID
  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.designations}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Update Designation (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.designations}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Designation (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.designations}/${id}`, {
      headers: getAuthHeader(),
    }),
};

export default designationAPI;