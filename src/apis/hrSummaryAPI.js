import api from './api';

const hrSummaryAPI = {
  getHRSummary: () => api.get('/hr-summary/summary'),
};

export default hrSummaryAPI;
