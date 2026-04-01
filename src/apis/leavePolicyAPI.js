// src/apis/leavePolicyAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const leavePolicyAPI = {
  // Create Leave Policy (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.leavePolicies}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Leave Policies without filters
  getAllWithoutFilters: () =>
    axios.get(`${apiRoutes.leavePolicies}/without-filters`, {
      headers: getAuthHeader(),
    }),

  // Get all Leave Policies with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.leavePolicies}`, {
      params: {
        search: params.search || "",
        leaveType: params.leaveType || "",
        genderRestriction: params.genderRestriction || "",
        carryForward: params.carryForward || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // Get single Leave Policy by ID
  getById: (id) =>
    axios.get(`${apiRoutes.leavePolicies}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Get Leave Policy by type
  getByType: (leaveType) =>
    axios.get(`${apiRoutes.leavePolicies}/type/${leaveType}`, {
      headers: getAuthHeader(),
    }),

  // Update Leave Policy (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.leavePolicies}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Leave Policy (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.leavePolicies}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Get available leave policies for employee (with gender filtering)
  getAvailable: () =>
    axios.get(`${apiRoutes.leavePolicies}/employee/available`, {
      headers: getAuthHeader(),
    }),
};

export default leavePolicyAPI;