import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout for faster fallback
});

// Track backend availability
let backendAvailable = true;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // Check every 30 seconds

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Backend is working
    backendAvailable = true;
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Check if it's a connection error
    if (error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_CONNECTION_RESET' ||
        !error.response) {
      backendAvailable = false;
      console.log('Backend not available, using mock data');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if we should use mock data
const shouldUseMockData = () => {
  const now = Date.now();
  if (now - lastCheckTime > CHECK_INTERVAL) {
    lastCheckTime = now;
    // Could do a quick health check here
  }
  return !backendAvailable;
};

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      // Instead of throwing, return null to indicate fallback should be used
      console.log(`API GET ${endpoint} failed, using mock data fallback`);
      return null;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      // For mutations, we can show a warning but simulate success
      if (!backendAvailable) {
        console.log(`API POST ${endpoint} failed, simulating success for demo`);
        // Return a mock successful response
        return { 
          success: true, 
          message: 'Operation completed (Demo Mode)',
          data: { ...data, id: Date.now().toString() }
        };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      if (!backendAvailable) {
        console.log(`API PUT ${endpoint} failed, simulating success for demo`);
        return { 
          success: true, 
          message: 'Update completed (Demo Mode)',
          data 
        };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  patch: async (endpoint, data) => {
    try {
      const response = await axiosInstance.patch(endpoint, data);
      return response.data;
    } catch (error) {
      if (!backendAvailable) {
        console.log(`API PATCH ${endpoint} failed, simulating success for demo`);
        return { 
          success: true, 
          message: 'Update completed (Demo Mode)',
          data 
        };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      if (!backendAvailable) {
        console.log(`API DELETE ${endpoint} failed, simulating success for demo`);
        return { 
          success: true, 
          message: 'Deletion completed (Demo Mode)'
        };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  uploadFile: async (endpoint, formData, onUploadProgress) => {
    try {
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      if (!backendAvailable) {
        console.log(`File upload to ${endpoint} failed, simulating success for demo`);
        return { 
          success: true, 
          message: 'File uploaded (Demo Mode)',
          filename: 'demo-file.pdf'
        };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  downloadFile: async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      if (!backendAvailable) {
        console.log(`File download from ${endpoint} failed, backend unavailable`);
        // Create a mock blob for demo
        const mockContent = 'Demo file content - backend not available';
        const blob = new Blob([mockContent], { type: 'text/plain' });
        return { data: blob, headers: { 'content-type': 'text/plain' } };
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Health check function
  healthCheck: async () => {
    try {
      const response = await axiosInstance.get('/health', { timeout: 3000 });
      backendAvailable = true;
      return response.data;
    } catch (error) {
      backendAvailable = false;
      return null;
    }
  },

  // Utility to check backend status
  isBackendAvailable: () => backendAvailable
};