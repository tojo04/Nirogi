import axios from 'axios';
import config from '../config/config.js';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Medications API calls
export const medicationsAPI = {
  search: (query, limit = 10) => api.get(`/medications/search?q=${query}&limit=${limit}`),
  getById: (id) => api.get(`/medications/${id}`),
  getByClass: (drugClass) => api.get(`/medications/class/${drugClass}`),
  getPopular: () => api.get('/medications/popular'),
  create: (medicationData) => api.post('/medications', medicationData),
  update: (id, medicationData) => api.put(`/medications/${id}`, medicationData),
  delete: (id) => api.delete(`/medications/${id}`),
};

// Pharmacies API calls
export const pharmaciesAPI = {
  getAll: () => api.get('/pharmacies'),
  getById: (id) => api.get(`/pharmacies/${id}`),
  getNearby: (coordinates, maxDistance = 10) => 
    api.get(`/pharmacies/nearby?lng=${coordinates[0]}&lat=${coordinates[1]}&maxDistance=${maxDistance}`),
  create: (pharmacyData) => api.post('/pharmacies', pharmacyData),
  update: (id, pharmacyData) => api.put(`/pharmacies/${id}`, pharmacyData),
  delete: (id) => api.delete(`/pharmacies/${id}`),
};

// Comparisons API calls
export const comparisonsAPI = {
  compare: (comparisonData) => api.post('/comparisons/compare', comparisonData),
  getSaved: () => api.get('/comparisons/saved'),
  getById: (id) => api.get(`/comparisons/${id}`),
  save: (id) => api.put(`/comparisons/${id}/save`),
  delete: (id) => api.delete(`/comparisons/${id}`),
};

// Users API calls
export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getHistory: () => api.get('/users/history'),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  importMedications: (data) => api.post('/admin/medications/import', data),
  importPharmacies: (data) => api.post('/admin/pharmacies/import', data),
  importPricing: (data) => api.post('/admin/pricing/import', data),
};

export default api; 