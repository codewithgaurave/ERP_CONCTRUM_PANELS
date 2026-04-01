// src/constants/api.js

const BASE_URL = import.meta.env.VITE_BASE_API;
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api";

const apiRoutes = {
  employees: `${BASE_URL}/${API_PREFIX}/employees`,
  departments: `${BASE_URL}/${API_PREFIX}/departments`,
  employmentStatuses: `${BASE_URL}/${API_PREFIX}/employment-status`,
  designations: `${BASE_URL}/${API_PREFIX}/designation`,
  workShifts: `${BASE_URL}/${API_PREFIX}/workshift`,
  leaves: `${BASE_URL}/${API_PREFIX}/leaves`,
  officeLocations: `${BASE_URL}/${API_PREFIX}/office-locations`,
  leavePolicies: `${BASE_URL}/${API_PREFIX}/leave-policies`,
  announcements: `${BASE_URL}/${API_PREFIX}/announcements`,
  attendance: `${BASE_URL}/${API_PREFIX}/attendance`,
  dashboard: `${BASE_URL}/${API_PREFIX}/dashboard`,
  tasks: `${BASE_URL}/${API_PREFIX}/tasks`,
  assets: `${BASE_URL}/${API_PREFIX}/assets`,
  assetRequests: `${BASE_URL}/${API_PREFIX}/asset-requests`,
  notices: `${BASE_URL}/${API_PREFIX}/notices`,
  payroll: `${BASE_URL}/${API_PREFIX}/payroll`,
  reports: `${BASE_URL}/${API_PREFIX}/reports`
};

export default apiRoutes;
