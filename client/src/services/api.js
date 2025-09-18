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
      throw new Error('Request setup error');
    }
  }
);

// ✅ Upload file with proper FormData handling
export const uploadFile = async (file, metadata = {}) => {
  try {
    console.log('📤 Starting file upload:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category || 'other');
    formData.append('description', metadata.description || '');
    formData.append('tags', metadata.tags || '');

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large files
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Upload progress: ${percentCompleted}%`);
      }
    });

    console.log('✅ Upload successful:', response);
    return response;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};

// ✅ NEW: Get actual file data
export const getFileData = async (fileId) => {
  try {
    console.log('📖 Getting file data for:', fileId);
    const response = await api.get(`/upload/data/${fileId}`);
    return response;
  } catch (error) {
    console.error('❌ Get file data failed:', error);
    throw error;
  }
};

// ✅ NEW: Download file
export const downloadFile = async (fileId, fileName) => {
  try {
    console.log('📥 Downloading file:', fileId);
    const response = await axios.get(`${API_BASE_URL}/upload/download/${fileId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw error;
  }
};

// ✅ Get file status
export const getFileStatus = async (fileId) => {
  try {
    console.log('🔍 Getting file status:', fileId);
    const response = await api.get(`/upload/status/${fileId}`);
    return response;
  } catch (error) {
    console.error('❌ Get file status failed:', error);
    throw error;
  }
};

// ✅ Health check
export const checkHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Health check passed:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    throw error;
  }
};

// ✅ Get all files
export const getAllFiles = async () => {
  try {
    const response = await api.get('/upload/files');
    return response;
  } catch (error) {
    console.error('❌ Get all files failed:', error);
    throw error;
  }
};

// ✅ Search files
export const searchFiles = async (params = {}) => {
  try {
    const response = await api.get('/upload/search', { params });
    return response;
  } catch (error) {
    console.error('❌ Search files failed:', error);
    throw error;
  }
};

export default api;
