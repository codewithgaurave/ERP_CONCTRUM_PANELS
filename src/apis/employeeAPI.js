// src/apis/employeeAPI.js
import axios from "axios";
import apiRoutes from "../contants/api";

// 🔑 Helper: get auth header with token
const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const employeeAPI = {
  // ----------------- AUTH -----------------
  login: (credentials) =>
    axios.post(`${apiRoutes.employees}/login`, credentials),

  // ----------------- EMPLOYEES -----------------
  register: (data) =>
    axios.post(`${apiRoutes.employees}/register`, data, {
      headers: getAuthHeader(),
    }),

  getAll: (params = {}) =>
    axios.get(`${apiRoutes.employees}`, {
      params,
      headers: getAuthHeader(),
    }),

  getById: (id, params = {}) =>
    axios.get(`${apiRoutes.employees}/${id}`, {
      params,
      headers: getAuthHeader(),
    }),

  update: (id, data) =>
    axios.put(`${apiRoutes.employees}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  toggleStatus: (id) =>
    axios.patch(`${apiRoutes.employees}/${id}/toggle-status`, {}, {
      headers: getAuthHeader(),
    }),

  bulkUpdateStatus: (payload) =>
    axios.patch(`${apiRoutes.employees}/bulk-status`, payload, {
      headers: getAuthHeader(),
    }),

  // ----------------- SECTION-SPECIFIC UPDATES -----------------
  updateBasicInfo: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/basic-info`, data, {
      headers: getAuthHeader(),
    }),

  updateAddress: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/address`, data, {
      headers: getAuthHeader(),
    }),

  updateEmploymentDetails: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/employment-details`, data, {
      headers: getAuthHeader(),
    }),

  updateBankDetails: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/bank-details`, data, {
      headers: getAuthHeader(),
    }),

  updateDocuments: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/documents`, data, {
      headers: getAuthHeader(),
    }),

  updateEmergencyContact: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/emergency-contact`, data, {
      headers: getAuthHeader(),
    }),

  changeDesignation: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/designation`, data, {
      headers: getAuthHeader(),
    }),

  changeDepartment: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/department`, data, {
      headers: getAuthHeader(),
    }),

  updateWorkSchedule: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/work-schedule`, data, {
      headers: getAuthHeader(),
    }),

  updatePersonalInfo: (id, data) =>
    axios.patch(`${apiRoutes.employees}/${id}/personal-info`, data, {
      headers: getAuthHeader(),
    }),

  // ----------------- TEAMS -----------------
  getTeamMembers: (params = {}) =>
    axios.get(`${apiRoutes.employees}/team`, {
      params,
      headers: getAuthHeader(),
    }),

  getEmployeesAddedByMe: (params = {}) =>
    axios.get(`${apiRoutes.employees}/added-by-me`, {
      params,
      headers: getAuthHeader(),
    }),

  // ----------------- DESIGNATION -----------------
  getByDesignation: (designation, params = {}) =>
    axios.get(`${apiRoutes.employees}/designation/${designation}`, {
      params,
      headers: getAuthHeader(),
    }),

  // ----------------- ROLE -----------------
  getByRole: (role, params = {}) =>
    axios.get(`${apiRoutes.employees}/role/${role}`, {
      params,
      headers: getAuthHeader(),
    }),

  getManagers: () =>
    axios.get(`${apiRoutes.employees}/managers`, {
      headers: getAuthHeader(),
    }),

  // ----------------- HR MANAGERS -----------------
  createHRManager: (data) =>
    axios.post(`${apiRoutes.employees}/hr/create`, data, {
      headers: getAuthHeader(),
    }),

  getAllHRManagers: (params = {}) =>
    axios.get(`${apiRoutes.employees}/hr/all`, {
      params,
      headers: getAuthHeader(),
    }),

  updateHRManager: (id, data) =>
    axios.put(`${apiRoutes.employees}/hr/update/${id}`, data, {
      headers: getAuthHeader(),
    }),

  deleteHRManager: (id) =>
    axios.delete(`${apiRoutes.employees}/hr/delete/${id}`, {
      headers: getAuthHeader(),
    }),

  // ----------------- STATS -----------------
  getStats: (params = {}) =>
    axios.get(`${apiRoutes.employees}/stats`, {
      params,
      headers: getAuthHeader(),
    }),

  // ----------------- PROFILE -----------------
  getMyProfile: () =>
    axios.get(`${apiRoutes.employees}/my-profile`, {
      headers: getAuthHeader(),
    }),

  updateMyProfile: (section, data) =>
    axios.patch(`${apiRoutes.employees}/my-profile/${section}`, data, {
      headers: getAuthHeader(),
    }),

  // ----------------- WITHOUT FILTERS -----------------
  getWithoutFilters: () =>
    axios.get(`${apiRoutes.employees}/without-filters`, {
      headers: getAuthHeader(),
    }),

  // ----------------- FORM DATA -----------------
  getFormData: () =>
    axios.get(`${apiRoutes.employees}/form-data`, {
      headers: getAuthHeader(),
    }),

  // ----------------- COLLEAGUES -----------------
  getColleagues: () =>
    axios.get(`${apiRoutes.employees}/colleagues`, {
      headers: getAuthHeader(),
    }),
};

export default employeeAPI;