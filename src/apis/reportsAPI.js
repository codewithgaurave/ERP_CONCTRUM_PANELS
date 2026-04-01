import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const reportsAPI = {
  // Employee Reports
  getEmployeeReports: () =>
    axios.get(`${apiRoutes.reports}/employees`, {
      headers: getAuthHeader(),
    }),

  // HR Team Employee Reports
  getHRTeamEmployeeReports: () =>
    axios.get(`${apiRoutes.reports}/team/employees`, {
      headers: getAuthHeader(),
    }),

  // Payroll Reports
  getPayrollReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/payroll`, {
      params,
      headers: getAuthHeader(),
    }),

  // HR Team Payroll Reports
  getHRTeamPayrollReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/team/payroll`, {
      params,
      headers: getAuthHeader(),
    }),

  // Asset Reports
  getAssetReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/assets`, {
      params,
      headers: getAuthHeader(),
    }),

  getAttendanceReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/attendance`, { params, headers: getAuthHeader() }),

  getHRTeamAttendanceReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/team/attendance`, { params, headers: getAuthHeader() }),

  getLeaveReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/leaves`, { params, headers: getAuthHeader() }),

  getHRTeamLeaveReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/team/leaves`, { params, headers: getAuthHeader() }),

  getDepartmentReports: (params = {}) =>
    axios.get(`${apiRoutes.reports}/departments`, { params, headers: getAuthHeader() }),
};

export default reportsAPI;