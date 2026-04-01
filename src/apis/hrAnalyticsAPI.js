import api from './api';

const hrAnalyticsAPI = {
  getHRAnalytics: () => api.get('/hr-analytics/dashboard'),
};

export default hrAnalyticsAPI;