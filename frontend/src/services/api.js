import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Energy Usage API
export const getEnergyUsage = async (timeRange = '24h') => {
  try {
    const response = await api.get(`/energy/usage?range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching energy usage:', error);
    throw error;
  }
};

export const getCurrentConsumption = async () => {
  try {
    const response = await api.get('/energy/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current consumption:', error);
    throw error;
  }
};

// Appliance API
export const getAppliances = async () => {
  try {
    const response = await api.get('/appliances');
    return response.data;
  } catch (error) {
    console.error('Error fetching appliances:', error);
    throw error;
  }
};

export const getApplianceUsage = async (applianceId, timeRange = '7d') => {
  try {
    const response = await api.get(`/appliances/${applianceId}/usage?range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appliance usage:', error);
    throw error;
  }
};

export const getApplianceBreakdown = async () => {
  try {
    const response = await api.get('/appliances/breakdown');
    return response.data;
  } catch (error) {
    console.error('Error fetching appliance breakdown:', error);
    throw error;
  }
};

// Prediction API
export const getPredictions = async (hours = 24) => {
  try {
    const response = await api.get(`/predictions?hours=${hours}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};

// Optimization API
export const getOptimizationSuggestions = async () => {
  try {
    const response = await api.get('/optimization/suggestions');
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

export const updateSuggestionStatus = async (suggestionId, status) => {
  try {
    const response = await api.patch(`/optimization/suggestions/${suggestionId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
};

export default api;
