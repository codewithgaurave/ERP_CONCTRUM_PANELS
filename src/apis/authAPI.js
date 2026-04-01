// src/apis/authAPI.js 
import api from "./api";

const userAPI = {
  login: (credentials) => api.post(`/employees/login`, credentials),
};

export default userAPI;
