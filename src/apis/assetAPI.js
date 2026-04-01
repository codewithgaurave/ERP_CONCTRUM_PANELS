import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const assetAPI = {
  // Create Asset
  create: (data) =>
    axios.post(`${apiRoutes.assets}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Assets with filters
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.assets}`, {
      params,
      headers: getAuthHeader(),
    }),

  // Get HR Team Assets (filtered for HR managers)
  getHRTeamAssets: (params = {}) =>
    axios.get(`${apiRoutes.assets}/team/hr`, {
      params,
      headers: getAuthHeader(),
    }),

  // Get HR Team Employees for Asset Assignment
  getHRTeamEmployees: () =>
    axios.get(`${apiRoutes.assets}/team/employees`, {
      headers: getAuthHeader(),
    }),

  // Get Team Leader Assets
  getTeamLeaderAssets: () =>
    axios.get(`${apiRoutes.assets}/team/leader`, {
      headers: getAuthHeader(),
    }),

  // Get single Asset by ID
  getById: (id) =>
    axios.get(`${apiRoutes.assets}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Update Asset
  update: (id, data) =>
    axios.put(`${apiRoutes.assets}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Asset
  delete: (id) =>
    axios.delete(`${apiRoutes.assets}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Assign Asset
  assign: (id, employeeId) =>
    axios.post(`${apiRoutes.assets}/${id}/assign`, { employeeId }, {
      headers: getAuthHeader(),
    }),

  // Assign Asset to HR Team Member
  assignToTeam: (id, employeeId) =>
    axios.post(`${apiRoutes.assets}/${id}/assign/team`, { employeeId }, {
      headers: getAuthHeader(),
    }),

  // Return Asset
  return: (id) =>
    axios.post(`${apiRoutes.assets}/${id}/return`, {}, {
      headers: getAuthHeader(),
    }),

  // Get Assets by Employee
  getAssetsByEmployee: (employeeId) =>
    axios.get(`${apiRoutes.assets}/employee/${employeeId}`, {
      headers: getAuthHeader(),
    }),

  // Get Assets by Employee (alias)
  getByEmployee: (employeeId) =>
    axios.get(`${apiRoutes.assets}/employee/${employeeId}`, {
      headers: getAuthHeader(),
    }),

  // Get Asset Categories
  getCategories: () =>
    axios.get(`${apiRoutes.assets}/categories`, {
      headers: getAuthHeader(),
    }),

  // Transfer Asset
  transferAsset: (assetId, toEmployeeId, transferType) =>
    axios.post(`${apiRoutes.assets}/${assetId}/transfer`, 
      { toEmployeeId, transferType },
      { headers: getAuthHeader() }
    ),

  // Get My Asset History
  getMyHistory: () =>
    axios.get(`${apiRoutes.assets}/history/my`, {
      headers: getAuthHeader(),
    }),
};

export default assetAPI;
export { assetAPI };