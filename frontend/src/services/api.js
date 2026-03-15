import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const findOptimalK = (filepath, maxK = 10) => {
  return api.post('/analyze/optimal-k', { filepath, max_k: maxK });
};

export const performClustering = (filepath, nClusters) => {
  return api.post('/analyze/cluster', { filepath, n_clusters: nClusters });
};

export const downloadResults = (filepath, clusteredData) => {
  return api.post('/download/results', { filepath, clustered_data: clusteredData }, {
    responseType: 'blob',
  });
};

export const healthCheck = () => {
  return api.get('/health');
};

export default api;