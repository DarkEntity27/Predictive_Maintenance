import axios from 'axios';
import { BatchRequest, NetworkAssessmentResponse, APUPredictRequest, APUPredictResponse } from '../types';

// In development: use /api proxy
// In production: use full URL or relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api'  // Use proxy in dev
    : 'http://127.0.0.1:8000'  // Use direct URL otherwise
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const maintenanceApi = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Assess network
  assessNetwork: async (request: BatchRequest): Promise<NetworkAssessmentResponse> => {
    const response = await api.post<NetworkAssessmentResponse>('/assess/network', request);
    return response.data;
  },

  // Assess batch
  assessBatch: async (request: BatchRequest) => {
    const response = await api.post('/assess/batch', request);
    return response.data;
  },
};

export const apuApi = {
  // Predict APU RUL
  predictAPU: async (request: APUPredictRequest): Promise<APUPredictResponse> => {
    const response = await api.post<APUPredictResponse>('/predict/apu', request);
    return response.data;
  },
};

export default api;
