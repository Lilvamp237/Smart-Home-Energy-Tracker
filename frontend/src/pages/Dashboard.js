import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import EnergyUsageChart from '../components/charts/EnergyUsageChart';
import { getCurrentConsumption, getEnergyUsage, getPredictions, checkBackendStatus } from '../services/api';
import { mockCurrentConsumption, mockEnergyUsage, mockPredictions, mockQuickStats } from '../utils/mockData';
import { formatCurrency, formatPower, formatDateTime } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
  const [energyData, setEnergyData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [quickStats, setQuickStats] = useState(mockQuickStats);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    if (backendAvailable !== null) {
      loadDashboardData();
    }
  }, [timeRange, backendAvailable]);

  const checkBackend = async () => {
    const isAvailable = await checkBackendStatus();
    setBackendAvailable(isAvailable);
    console.log(`Backend ${isAvailable ? 'connected' : 'unavailable'} - using ${isAvailable ? 'real' : 'mock'} data`);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (backendAvailable) {
        // Use real API
        const [usage, pred] = await Promise.all([
          getEnergyUsage(timeRange),
          getPredictions(24)
        ]);
        
        console.log('Dashboard API responses:', { usage, pred });
        
        setEnergyData(Array.isArray(usage) && usage.length > 0 ? usage : mockEnergyUsage.hourly);
        setPredictions(pred);
        
        // Calculate quick stats from real data
        const currentData = usage && usage.length > 0 ? usage[usage.length - 1] : null;
        const totalConsumption = usage ? usage.reduce((sum, item) => sum + (item.consumption || 0), 0) : 0;
        const totalCost = usage ? usage.reduce((sum, item) => sum + (item.cost || 0), 0) : 0;
        
        setQuickStats({
          currentConsumption: currentData?.consumption ? currentData.consumption * 12 : 0,
          todayPredictedVsActual: pred?.summary?.difference || 0,
          optimizationActions: 5,
          todayCost: pred?.summary?.actualCostToday || totalCost,
          weeklyAverage: totalConsumption / 7,
          monthlyProjection: totalCost * 30
        });
      } else {
        // Use mock data
        setEnergyData(mockEnergyUsage.hourly);
        setPredictions(mockPredictions);
        setQuickStats(mockQuickStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      // Fallback to mock data on error
      setEnergyData(mockEnergyUsage.hourly);
      setPredictions(mockPredictions);
      setQuickStats(mockQuickStats);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Don't set mock data here - let useEffect reload from API
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
            {backendAvailable !== null && (
              <span className={`backend-status ${backendAvailable ? 'connected' : 'offline'}`}>
                {' '}• {backendAvailable ? '🟢 Backend Connected' : '🔴 Using Mock Data'}
              </span>
            )}
          </p>
        </div>
        <button className="refresh-button" onClick={loadDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error} - Displaying cached data
        </div>
      )}

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Current Consumption"
          value={formatPower(quickStats.currentConsumption)}
          subtitle="Real-time usage"
          icon="⚡"
          color="blue"
        />
        <StatCard
          title="Today's Cost"
          value={formatCurrency(quickStats.todayCost)}
          subtitle="Predicted vs Actual"
          icon="💰"
          color="green"
          trend={{
            direction: quickStats.todayPredictedVsActual > 0 ? 'up' : 'down',
            value: formatCurrency(Math.abs(quickStats.todayPredictedVsActual)),
            label: 'difference'
          }}
        />
        <StatCard
          title="Weekly Average"
          value={`${quickStats.weeklyAverage.toFixed(1)} kWh`}
          subtitle="Last 7 days"
          icon="📊"
          color="purple"
        />
        <StatCard
          title="Available Actions"
          value={quickStats.optimizationActions}
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
