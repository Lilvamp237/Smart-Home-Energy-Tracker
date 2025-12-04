import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import EnergyUsageChart from '../components/charts/EnergyUsageChart';
import { getCurrentConsumption, getEnergyUsage, getPredictions } from '../services/api';
import { mockCurrentConsumption, mockEnergyUsage, mockPredictions, mockQuickStats } from '../utils/mockData';
import { formatCurrency, formatPower, formatDateTime } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
  const [currentConsumption, setCurrentConsumption] = useState(null);
  const [energyData, setEnergyData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [useMockData] = useState(false); // Toggle this for real API

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock data for development
        setCurrentConsumption(mockCurrentConsumption);
        setEnergyData(mockEnergyUsage.hourly);
        setPredictions(mockPredictions);
      } else {
        // Real API calls (when backend is ready)
        const [consumption, usage, pred] = await Promise.all([
          getCurrentConsumption(),
          getEnergyUsage(timeRange),
          getPredictions(24)
        ]);
        setCurrentConsumption(consumption);
        setEnergyData(usage);
        setPredictions(pred);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data on error
      setCurrentConsumption(mockCurrentConsumption);
      setEnergyData(mockEnergyUsage.hourly);
      setPredictions(mockPredictions);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range === '24h') setEnergyData(mockEnergyUsage.hourly);
    if (range === '7d') setEnergyData(mockEnergyUsage.daily);
    if (range === '30d') setEnergyData(mockEnergyUsage.weekly);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Panel */}
      <div className="welcome-panel">
        <div>
          <h1 className="dashboard-title">Energy Dashboard</h1>
          <p className="dashboard-subtitle">
            {formatDateTime(new Date())}
          </p>
        </div>
        <button className="refresh-button" onClick={loadDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Current Consumption"
          value={formatPower(mockQuickStats.currentConsumption)}
          subtitle="Real-time usage"
          icon="⚡"
          color="blue"
        />
        <StatCard
          title="Today's Cost"
          value={formatCurrency(mockQuickStats.todayCost)}
          subtitle="Predicted vs Actual"
          icon="💰"
          color="green"
          trend={{
            direction: mockQuickStats.todayPredictedVsActual > 0 ? 'up' : 'down',
            value: formatCurrency(Math.abs(mockQuickStats.todayPredictedVsActual)),
            label: 'difference'
          }}
        />
        <StatCard
          title="Weekly Average"
          value={`${mockQuickStats.weeklyAverage} kWh`}
          subtitle="Last 7 days"
          icon="📊"
          color="purple"
        />
        <StatCard
          title="Available Actions"
          value={mockQuickStats.optimizationActions}
          subtitle="Energy-saving suggestions"
          icon="💡"
          color="orange"
        />
      </div>

      {/* Main Usage Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Energy Usage Over Time</h2>
          <div className="time-range-selector">
            <button
              className={`range-button ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('24h')}
            >
              24 Hours
            </button>
            <button
              className={`range-button ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('7d')}
            >
              7 Days
            </button>
            <button
              className={`range-button ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('30d')}
            >
              30 Days
            </button>
          </div>
        </div>
        <EnergyUsageChart data={energyData} timeRange={timeRange} />
      </div>

      {/* Prediction Summary */}
      {predictions && (
        <div className="prediction-section">
          <h2 className="section-title">24-Hour Forecast</h2>
          <div className="prediction-summary">
            <div className="prediction-card">
              <div className="prediction-label">Predicted Cost</div>
              <div className="prediction-value">
                {formatCurrency(predictions.summary.predictedCost)}
              </div>
            </div>
            <div className="prediction-card">
              <div className="prediction-label">Actual Cost (Today)</div>
              <div className="prediction-value">
                {formatCurrency(predictions.summary.actualCostToday)}
              </div>
            </div>
            <div className="prediction-card">
              <div className="prediction-label">Difference</div>
              <div className={`prediction-value ${predictions.summary.difference > 0 ? 'negative' : 'positive'}`}>
                {predictions.summary.difference > 0 ? '+' : ''}
                {formatCurrency(predictions.summary.difference)}
              </div>
            </div>
            <div className="prediction-card">
              <div className="prediction-label">Trend</div>
              <div className="prediction-trend">
                {predictions.summary.trend === 'increasing' ? '📈' : '📉'}
                <span className="trend-text">{predictions.summary.trend}</span>
              </div>
            </div>
          </div>
          <EnergyUsageChart data={predictions.next24Hours} timeRange="24h" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
