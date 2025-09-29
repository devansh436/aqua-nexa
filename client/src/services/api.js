const API_BASE_URL = 'http://localhost:5000/api';

// Upload file with metadata
export const uploadFile = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', metadata.category);
  formData.append('description', metadata.description || '');
  formData.append('tags', metadata.tags || '');

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return await response.json();
};

// Get unified datasets
export const getUnifiedDatasets = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.location) params.append('location', filters.location);
  if (filters.dateRange) params.append('dateRange', filters.dateRange);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`${API_BASE_URL}/upload/unified?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch unified datasets');
  }

  return await response.json();
};

// Export unified dataset
export const exportUnifiedDataset = async (format = 'json') => {
  const response = await fetch(`${API_BASE_URL}/upload/export?format=${format}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Export failed');
  }

  if (format === 'csv') {
    return await response.text();
  }
  
  return await response.json();
};

// Get file data
export const getFileData = async (fileId) => {
  const response = await fetch(`${API_BASE_URL}/upload/file/${fileId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch file data');
  }

  return await response.json();
};

// Health check
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/upload/health`);
  
  if (!response.ok) {
    throw new Error('Server health check failed');
  }

  return await response.json();
};
