import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Charger endpoints
export const getChargers = (region) => api.get('/chargers', { params: { region } });
export const getCompatibleChargers = async (vehiclePorts, region) => {
  const ports = Array.isArray(vehiclePorts) ? vehiclePorts : [vehiclePorts];
  const uniquePorts = [...new Set(ports)].filter(Boolean);
  if (uniquePorts.length === 0) return [];
  const results = await Promise.all(
    uniquePorts.map((port) => api.get(`/chargers/compatible/${encodeURIComponent(port)}`))
  );
  const merged = [];
  const seen = new Set();
  results.forEach((list) => {
    list.forEach((charger) => {
      const key = charger._id || `${charger.type}-${charger.region || ''}`;
      if (!seen.has(key) && (!region || charger.region === region)) {
        merged.push(charger);
        seen.add(key);
      }
    });
  });
  return merged;
};
export const fetchVendorChargers = () => api.get('/chargers/vendor/fetch');

// Vehicle endpoints
export const getVehicles = (region) => 
  api.get('/vehicles', { params: { region } });
export const getVehiclesByRegion = (region) => getVehicles(region);

// Cost calculation endpoints
export const calculateInstallationCost = (data) => 
  api.post('/cost/installation', data);
export const calculateROI = (data) => api.post('/cost/roi', data);

// Planning endpoints
export const singleSitePlanning = (data) => 
  api.post('/planning/single-site', data);
export const optimizeMultiSite = (data) => 
  api.post('/planning/multi-site/optimize', data);

// Regional data endpoints
export const getRegions = () => api.get('/planning/regions');
export const getStatesByRegion = (region) => 
  api.get(`/planning/region/${region}/states`);
export const getCitiesByRegionState = (region, state) => 
  api.get(`/planning/region/${region}/cities`, { params: { state } });
export const getLoadCapacity = (region, location) => 
  api.get(`/planning/region/${region}/load-capacity/${location}`);

// Project management endpoints
export const getProjects = () => api.get('/planning/projects');
export const getProject = (id) => api.get(`/planning/project/${id}`);
export const createProject = (data) => api.post('/planning/project', data);
export const updateProject = (id, data) => 
  api.put(`/planning/project/${id}`, data);
export const deleteProject = (id) => api.delete(`/planning/project/${id}`);

// Report generation endpoints
export const generateReport = (data) => api.post('/reports/generate', data);
export const downloadReport = (id) => 
  api.get(`/reports/download/${id}`, { responseType: 'blob' });

// Auth endpoints
export const login = (email, password) => api.post('/auth/login', { email, password });

// Visualization endpoints
export const generate3DLayout = (location, images, opts = {}) => {
  const formData = new FormData();
  formData.append('location', location);
  if (opts.projectId) {
    formData.append('project_id', opts.projectId);
  }
  if (opts.siteId) {
    formData.append('site_id', opts.siteId);
  }
  if (images) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }
  return api.post('/visualization/3d-layout', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default {
  getChargers,
  getCompatibleChargers,
  fetchVendorChargers,
  getVehicles,
  getVehiclesByRegion,
  calculateInstallationCost,
  calculateROI,
  singleSitePlanning,
  optimizeMultiSite,
  getRegions,
  getStatesByRegion,
  getCitiesByRegionState,
  getLoadCapacity,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  generateReport,
  downloadReport,
  login,
  generate3DLayout,
};
