// src/apis/workShiftAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const workShiftAPI = {
  // Create WorkShift (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.workShifts}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all WorkShifts with filters
  getAllWithoutFilters: () =>
    axios.get(`${apiRoutes.workShifts}/without-filters`, {
      headers: getAuthHeader(),
    }),

  // Get all WorkShifts with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.workShifts}`, {
      params: {
        search: params.search || "",
        status: params.status || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // Get single WorkShift by ID
  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.workShifts}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Update WorkShift (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.workShifts}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete WorkShift (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.workShifts}/${id}`, {
      headers: getAuthHeader(),
    }),
};

export default workShiftAPI;