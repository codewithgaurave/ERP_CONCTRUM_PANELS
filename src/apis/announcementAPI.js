import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const announcementAPI = {
  // Create Announcement (HR only)
  create: (data) =>
    axios.post(`${apiRoutes.announcements}`, data, {
      headers: getAuthHeader(),
    }),

  // Get all Announcements with filters (HR only)
  getAll: (params = {}) =>
    axios.get(`${apiRoutes.announcements}`, {
      params: {
        category: params.category || "",
        isActive: params.isActive || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // Get my announcements (for employees)
  getMyAnnouncements: (params = {}) =>
    axios.get(`${apiRoutes.announcements}/my-announcements`, {
      params: {
        category: params.category || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // Get single Announcement by ID
  getById: (id) =>
    axios.get(`${apiRoutes.announcements}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Update Announcement (HR only)
  update: (id, data) =>
    axios.put(`${apiRoutes.announcements}/${id}`, data, {
      headers: getAuthHeader(),
    }),

  // Delete Announcement (HR only)
  delete: (id) =>
    axios.delete(`${apiRoutes.announcements}/${id}`, {
      headers: getAuthHeader(),
    }),

  // Toggle announcement status (HR only)
  toggleStatus: (id) =>
    axios.patch(`${apiRoutes.announcements}/${id}/toggle-status`, {}, {
      headers: getAuthHeader(),
    }),

  // Get announcement statistics (HR only)
  getStats: () =>
    axios.get(`${apiRoutes.announcements}/stats`, {
      headers: getAuthHeader(),
    }),

  // NEW: Get my announcement statistics (HR-specific)
  getMyStats: () =>
    axios.get(`${apiRoutes.announcements}/my-stats`, {
      headers: getAuthHeader(),
    }),

  // NEW: Get HR-managed employees
  getHRManagedEmployees: () =>
    axios.get(`${apiRoutes.announcements}/hr-managed-employees`, {
      headers: getAuthHeader(),
    }),

  // NEW: Create HR-scoped announcement
  createHRScoped: (data) =>
    axios.post(`${apiRoutes.announcements}/hr-scoped`, data, {
      headers: getAuthHeader(),
    }),

  // NEW: Get HR-scoped announcements
  getHRScoped: (params = {}) =>
    axios.get(`${apiRoutes.announcements}/hr-scoped`, {
      params: {
        category: params.category || "",
        isActive: params.isActive || "",
        search: params.search || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // NEW: Get employee filtered announcements (only from their HR)
  getEmployeeFiltered: (params = {}) =>
    axios.get(`${apiRoutes.announcements}/employee-filtered`, {
      params: {
        category: params.category || "",
        search: params.search || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),

  // NEW: Get announcements created by the logged-in user
  getMyCreated: (params = {}) =>
    axios.get(`${apiRoutes.announcements}/created-by-me`, {
      params: {
        category: params.category || "",
        search: params.search || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
        page: params.page || 1,
        limit: params.limit || 10,
      },
      headers: getAuthHeader(),
    }),
};

export default announcementAPI;