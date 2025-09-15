import axios from 'axios';

// ✅ Use direct URL since you're running on different ports
const API_BASE_URL = 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message || 'Request failed');
    }
  }
);

// Upload API functions
export const uploadFile = (file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(metadata).forEach(key => {
    if (metadata[key] !== undefined && metadata[key] !== '') {
      formData.append(key, metadata[key]);
    }
  });

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const getFileStatus = (fileId) => {
  return api.get(`/upload/status/${fileId}`);
};

export const getFileMetadata = (fileId) => {
  return api.get(`/upload/metadata/${fileId}`);
};

export const searchFiles = (params) => {
  return api.get('/upload/search', { params });
};

// ✅ Direct health check
export const checkHealth = () => {
  return axios.get('http://localhost:5000/health');
};

export default api;
