import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const dashboardAPI = {
  // ✅ Get comprehensive dashboard stats
  getDashboardStats: () =>
    axios.get(`${apiRoutes.dashboard}/stats`, {
      headers: getAuthHeader(),
    }),

  // ✅ Get detailed analytics for charts
  getDashboardAnalytics: (period = "month") =>
    axios.get(`${apiRoutes.dashboard}/analytics`, {
      params: { period },
      headers: getAuthHeader(),
    }),
};

export default dashboardAPI;