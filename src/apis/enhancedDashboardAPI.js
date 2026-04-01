import apiRoutes from '../contants/api';

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const enhancedDashboardAPI = {
  // Get comprehensive HR dashboard statistics
  getEnhancedHRStats: async () => {
    try {
      const response = await fetch(`${apiRoutes.dashboard.replace('/dashboard', '/enhanced-dashboard')}/hr-stats`, {
        method: 'GET',
        headers: getAuthHeader(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch enhanced dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Enhanced Dashboard API Error:', error);
      throw error;
    }
  }
};

export default enhancedDashboardAPI;