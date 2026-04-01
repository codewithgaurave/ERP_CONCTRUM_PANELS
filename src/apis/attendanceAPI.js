import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const attendanceAPI = {
  //  Punch In
  punchIn: (data) =>
    axios.post(`${apiRoutes.attendance}/punch-in`, data, {
      headers: getAuthHeader(),
    }),

  //  Punch Out
  punchOut: (data) =>
    axios.post(`${apiRoutes.attendance}/punch-out`, data, {
      headers: getAuthHeader(),
    }),

  //  Punch In by hr manager for en employee
  punchInByHr: (employeeId,data) =>
    axios.post(`${apiRoutes.attendance}/${employeeId}/punch-in/by-hr`, data, {
      headers: getAuthHeader(),
    }),

  //  Punch Out by hr manager for en employee
  punchOutByHr: (employeeId,data) =>
    axios.post(`${apiRoutes.attendance}/${employeeId}/punch-out/by-hr`, data, {
      headers: getAuthHeader(),
    }),

  //  Get Today's Attendance (for current employee)
  getTodayAttendance: () =>
    axios.get(`${apiRoutes.attendance}/today`, {
      headers: getAuthHeader(),
    }),

  getTodayAttendanceOfEmployee: (employeeId) =>
    axios.get(`${apiRoutes.attendance}/employee/${employeeId}/today`, {
      headers: getAuthHeader(),
    }),

  getMyAttendance: (params = {}) =>
    axios.get(`${apiRoutes.attendance}/my-attendances`, {
      params: {
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        status: params.status || "",
        page: params.page || 1,
        limit: params.limit || 30,
        sortBy: params.sortBy || "date",
        sortOrder: params.sortOrder || "desc"
      },
      headers: getAuthHeader(),
    }),
  //  Get Attendance Records with Enhanced Filters
  getAttendance: (params = {}) =>
    axios.get(`${apiRoutes.attendance}`, {
      params: {
        employeeId: params.employeeId || "",
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        status: params.status || "",
        department: params.department || "",
        designation: params.designation || "",
        officeLocation: params.officeLocation || "",
        shift: params.shift || "",
        search: params.search || "",
        page: params.page || 1,
        limit: params.limit || 30,
        sortBy: params.sortBy || "date",
        sortOrder: params.sortOrder || "desc"
      },
      headers: getAuthHeader(),
    }),

  //  Get Team Attendance (for team leaders)
  getTeamAttendance: (params = {}) =>
    axios.get(`${apiRoutes.attendance}/team`, {
      params: {
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        status: params.status || "",
        search: params.search || "",
        page: params.page || 1,
        limit: params.limit || 30,
        sortBy: params.sortBy || "date",
        sortOrder: params.sortOrder || "desc"
      },
      headers: getAuthHeader(),
    }),

  //  Get Attendance Summary
  getAttendanceSummary: (params = {}) =>
    axios.get(`${apiRoutes.attendance}/summary`, {
      params: {
        employeeId: params.employeeId || "",
        startDate: params.startDate || "",
        endDate: params.endDate || new Date(),
      },
      headers: getAuthHeader(),
    }),

  //  Get Team Attendance Summary (for team leaders)
  getTeamAttendanceSummary: (params = {}) =>
    axios.get(`${apiRoutes.attendance}/team/summary`, {
      params: {
        startDate: params.startDate || "",
        endDate: params.endDate || new Date(),
      },
      headers: getAuthHeader(),
    }),

  //  Get Attendance Filters Data
  getAttendanceFilters: () =>
    axios.get(`${apiRoutes.attendance}/filters`, {
      headers: getAuthHeader(),
    }),

  //  Update Attendance (Manual correction by HR/Manager)
  updateAttendance: (id, data) =>
    axios.put(`${apiRoutes.attendance}/${id}`, data, {
      headers: getAuthHeader(),
    }),
    
  // Get Employee Attendances (all three types)
  getEmployeeAttendances: (employeeId, params = {}) =>
    axios.get(`${apiRoutes.attendance}/${employeeId}/details`, {
         params: {
      type: params.type || 'records',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      status: params.status || '',
      period: params.period || 'month',
      year: params.year || new Date().getFullYear(),
      month: params.month || new Date().getMonth() + 1,
      page: params.page || 1,
      limit: params.limit || 30,
      sortBy: params.sortBy || 'date',
      sortOrder: params.sortOrder || 'desc'
    },
      headers: getAuthHeader(),
    }),
};

export default attendanceAPI;