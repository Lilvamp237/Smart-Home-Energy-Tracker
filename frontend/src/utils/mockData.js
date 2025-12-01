// Mock data for development when backend is not available

export const mockCurrentConsumption = {
  current: 3.5,
  unit: 'kW',
  timestamp: new Date().toISOString()
};

export const mockEnergyUsage = {
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    consumption: Math.random() * 5 + 1,
    cost: Math.random() * 2 + 0.5
  })),
  daily: Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    consumption: Math.random() * 50 + 20,
    cost: Math.random() * 20 + 8
  })),
  weekly: Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    consumption: Math.random() * 300 + 100,
    cost: Math.random() * 120 + 40
  }))
};

export const mockAppliances = [
  { id: 1, name: 'HVAC', type: 'heating_cooling', powerRating: 3500, status: 'active' },
  { id: 2, name: 'Refrigerator', type: 'appliance', powerRating: 150, status: 'active' },
  { id: 3, name: 'Washer', type: 'appliance', powerRating: 500, status: 'idle' },
  { id: 4, name: 'Dryer', type: 'appliance', powerRating: 3000, status: 'idle' },
  { id: 5, name: 'Water Heater', type: 'heating_cooling', powerRating: 4500, status: 'active' },
  { id: 6, name: 'Dishwasher', type: 'appliance', powerRating: 1800, status: 'idle' },
  { id: 7, name: 'TV', type: 'electronics', powerRating: 200, status: 'active' },
  { id: 8, name: 'Computer', type: 'electronics', powerRating: 300, status: 'active' }
];

export const mockApplianceBreakdown = [
  { name: 'HVAC', value: 35, consumption: 42.5, color: '#8884d8' },
  { name: 'Water Heater', value: 25, consumption: 30.2, color: '#82ca9d' },
  { name: 'Washer/Dryer', value: 15, consumption: 18.1, color: '#ffc658' },
  { name: 'Refrigerator', value: 10, consumption: 12.0, color: '#ff8042' },
  { name: 'Electronics', value: 10, consumption: 12.0, color: '#a4de6c' },
  { name: 'Other', value: 5, consumption: 6.2, color: '#d084d0' }
];

export const mockPredictions = {
  next24Hours: Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    predicted: Math.random() * 5 + 1.5,
    confidence: 0.85 + Math.random() * 0.1
  })),
  summary: {
    predictedCost: 12.45,
    actualCostToday: 11.80,
    difference: 0.65,
    trend: 'increasing'
  }
};

export const mockOptimizationSuggestions = [
  {
    id: 1,
    title: 'Run washer and dryer during off-peak hours',
    description: 'Running high-power appliances between 10 PM and 6 AM can save up to 40% on energy costs.',
    impact: {
      energySaving: '2.5 kWh/day',
      costSaving: '$0.85/day',
      score: 8.5
    },
    rule: 'off_peak_usage',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Check HVAC filter',
    description: 'Your HVAC system is consuming 15% more energy than usual. A dirty filter might be reducing efficiency.',
    impact: {
      energySaving: '5.2 kWh/day',
      costSaving: '$1.75/day',
      score: 9.2
    },
    rule: 'efficiency_check',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 3,
    title: 'Adjust thermostat by 2°F',
    description: 'Setting your thermostat 2°F lower in winter (or higher in summer) can reduce HVAC energy usage significantly.',
    impact: {
      energySaving: '3.8 kWh/day',
      costSaving: '$1.30/day',
      score: 7.8
    },
    rule: 'temperature_optimization',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 4,
    title: 'Water heater temperature check',
    description: 'Your water heater is set to 140°F. Reducing to 120°F is safe and more efficient.',
    impact: {
      energySaving: '1.8 kWh/day',
      costSaving: '$0.60/day',
      score: 6.5
    },
    rule: 'temperature_optimization',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 5,
    title: 'Enable power-saving mode on electronics',
    description: 'Electronics are consuming standby power. Enable sleep mode or use smart power strips.',
    impact: {
      energySaving: '0.8 kWh/day',
      costSaving: '$0.25/day',
      score: 4.5
    },
    rule: 'standby_power',
    status: 'pending',
    priority: 'low'
  }
];

export const mockQuickStats = {
  currentConsumption: 3.5,
  todayPredictedVsActual: 0.65,
  optimizationActions: 5,
  todayCost: 11.80,
  weeklyAverage: 45.2,
  monthlyProjection: 195.50
};
