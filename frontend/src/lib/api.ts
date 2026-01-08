import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getCashflowAnalysis = () => api.get('/dashboard/cashflow');
export const getExpenseBreakdown = () => api.get('/dashboard/expense-breakdown');

// Inventory API
export const getInventory = () => api.get('/inventory');
export const getInventoryAlerts = () => api.get('/inventory/alerts');
export const optimizeInventory = () => api.get('/inventory/optimize');

// Cashflow API
export const getTransactions = () => api.get('/cashflow/transactions');
export const getSpivotScore = () => api.get('/cashflow/score');
export const getCashProjection = (days: number = 30) => api.get(`/cashflow/projection?days=${days}`);

// Forecast API
export const getDemandForecast = (days: number = 30) => api.get(`/forecast/demand?days=${days}`);

// Agents API
export const getAgentLogs = (limit: number = 50) => api.get(`/agents/logs?limit=${limit}`);
export const getAgentsStatus = () => api.get('/agents/status');

// Documents API
export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getDocuments = () => api.get('/documents');

// Demo API
export const resetDemo = (crisisMode: boolean = true) => 
  api.post(`/demo/reset?crisis_mode=${crisisMode}`);
export const seedDemo = (crisisMode: boolean = false) =>
  api.post(`/demo/seed?crisis_mode=${crisisMode}`);
