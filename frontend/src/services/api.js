import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for model predictions
});

// Check if backend is available
export const checkBackendStatus = async () => {
  try {
    const response = await axios.get('http://localhost:5000/', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

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

// Time Slot API (for optimization)
export const getTimeSlotInfo = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/optimization/timeslot');
    return response.data;
  } catch (error) {
    console.error('Error fetching time slot info:', error);
    throw error;
  }
};

// Historical Data API
export const getHistoricalUsage = async (params = {}) => {
  try {
    const { household_id, start_date, end_date } = params;
    const queryParams = new URLSearchParams();
    if (household_id) queryParams.append('household_id', household_id);
    if (start_date) queryParams.append('start_date', start_date);
    if (end_date) queryParams.append('end_date', end_date);
    
    const response = await axios.get(
      `http://localhost:5000/api/v1/usage/historical?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical usage:', error);
    throw error;
  }
};

export default api;
