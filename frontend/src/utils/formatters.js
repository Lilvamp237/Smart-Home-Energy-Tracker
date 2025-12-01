// Utility functions for formatting data

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatEnergy = (kWh, decimals = 2) => {
  return `${kWh.toFixed(decimals)} kWh`;
};

export const formatPower = (kW, decimals = 2) => {
  return `${kW.toFixed(decimals)} kW`;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

export const getPriorityColor = (priority) => {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };
  return colors[priority] || '#6b7280';
};

export const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    idle: '#6b7280',
    offline: '#ef4444',
    pending: '#f59e0b',
    completed: '#10b981',
    dismissed: '#6b7280'
  };
  return colors[status] || '#6b7280';
};

export const getTrendIcon = (trend) => {
  const icons = {
    increasing: '↑',
    decreasing: '↓',
    stable: '→'
  };
  return icons[trend] || '→';
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
