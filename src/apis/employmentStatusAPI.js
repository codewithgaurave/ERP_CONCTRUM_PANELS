// src/apis/employmentStatusAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const employmentStatusAPI = {
  // Create Employment Status (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.employmentStatuses}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Employment Statuses with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.employmentStatuses}`, {
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

  // Get single Employment Status by ID
  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.employmentStatuses}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Update Employment Status (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.employmentStatuses}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Employment Status (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.employmentStatuses}/${id}`, {
      headers: getAuthHeader(),
    }),
};

export default employmentStatusAPI;