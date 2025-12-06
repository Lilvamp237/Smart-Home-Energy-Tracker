import React, { useState, useEffect } from 'react';
import ApplianceBreakdownChart from '../components/charts/ApplianceBreakdownChart';
import ApplianceComparisonChart from '../components/charts/ApplianceComparisonChart';
import EnergyUsageChart from '../components/charts/EnergyUsageChart';
import { getAppliances, getApplianceBreakdown, getApplianceUsage, checkBackendStatus } from '../services/api';
import { mockAppliances, mockApplianceBreakdown, mockEnergyUsage } from '../utils/mockData';
import { formatEnergy, formatPower, getStatusColor } from '../utils/formatters';
import './Appliances.css';

const Appliances = () => {
  const [appliances, setAppliances] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [applianceData, setApplianceData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    if (backendAvailable !== null) {
      loadApplianceData();
    }
  }, [backendAvailable]);

  const checkBackend = async () => {
    const isAvailable = await checkBackendStatus();
    setBackendAvailable(isAvailable);
  };

  useEffect(() => {
    if (selectedAppliance) {
      loadApplianceUsage(selectedAppliance.id);
    }
  }, [selectedAppliance, timeRange]);

  const loadApplianceData = async () => {
    setLoading(true);
    try {
      if (backendAvailable) {
        const [applianceList, breakdownData] = await Promise.all([
          getAppliances(),
          getApplianceBreakdown()
        ]);
        setAppliances(applianceList);
        setBreakdown(breakdownData);
        if (applianceList.length > 0) {
          setSelectedAppliance(applianceList[0]);
        }
      } else {
        setAppliances(mockAppliances);
        setBreakdown(mockApplianceBreakdown);
        setSelectedAppliance(mockAppliances[0]);
      }
    } catch (error) {
      console.error('Error loading appliance data:', error);
      setAppliances(mockAppliances);
      setBreakdown(mockApplianceBreakdown);
      setSelectedAppliance(mockAppliances[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadApplianceUsage = async (applianceId) => {
    try {
      if (backendAvailable) {
        const usage = await getApplianceUsage(applianceId, timeRange);
        // Format backend data for the chart
        const formattedData = usage.map(item => ({
          day: new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
          consumption: item.consumption,
          cost: item.cost
        }));
        setApplianceData(formattedData);
      } else {
        setApplianceData(mockEnergyUsage.daily);
      }
    } catch (error) {
      console.error('Error loading appliance usage:', error);
      setApplianceData(mockEnergyUsage.daily);
    }
  };

  const handleApplianceSelect = (appliance) => {
    setSelectedAppliance(appliance);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div className="appliances-page">
        <div className="loading-spinner">Loading appliances...</div>
      </div>
    );
  }

  return (
    <div className="appliances-page">
      <div className="page-header">
        <h1 className="page-title">Appliance Management</h1>
        <p className="page-subtitle">
          Monitor and analyze individual appliance energy consumption
          {backendAvailable !== null && (
            <span className={`backend-status ${backendAvailable ? 'connected' : 'offline'}`}>
              {' '}• {backendAvailable ? '🟢 Live Data' : '🔴 Demo Mode'}
            </span>
          )}
        </p>
      </div>

      {/* Appliance Breakdown */}
      <div className="section">
        <h2 className="section-title">Energy Consumption Breakdown</h2>
        <ApplianceBreakdownChart data={breakdown} />
      </div>

      {/* Appliance Comparison */}
      <div className="section">
        <h2 className="section-title">Appliance Comparison</h2>
        <ApplianceComparisonChart 
          data={appliances.map(app => ({
            name: app.name,
            consumption: (app.powerRating / 1000) * (app.status === 'active' ? 8 : 2)
          }))}
        />
      </div>

      {/* Appliance List and Detail View */}
      <div className="appliance-detail-section">
        <div className="appliance-selector">
          <h2 className="section-title">Select Appliance</h2>
          <div className="appliance-filters">
            <input
              type="text"
              placeholder="Search appliances..."
              className="search-input"
            />
            <select className="filter-select">
              <option value="all">All Types</option>
              <option value="heating_cooling">Heating & Cooling</option>
              <option value="appliance">Appliances</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>
          <div className="appliance-list">
            {appliances.map((appliance) => (
              <div
                key={appliance.id}
                className={`appliance-card ${selectedAppliance?.id === appliance.id ? 'selected' : ''}`}
                onClick={() => handleApplianceSelect(appliance)}
              >
                <div className="appliance-header">
                  <h3 className="appliance-name">{appliance.name}</h3>
                  <span
                    className="appliance-status"
                    style={{ color: getStatusColor(appliance.status) }}
                  >
                    ● {appliance.status}
                  </span>
                </div>
                <div className="appliance-info">
                  <div className="info-item">
                    <span className="info-label">Power Rating:</span>
                    <span className="info-value">{formatPower(appliance.powerRating / 1000)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{appliance.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed View */}
        {selectedAppliance && (
          <div className="appliance-details">
            <div className="detail-header">
              <h2 className="section-title">{selectedAppliance.name} Usage</h2>
              <div className="time-range-selector">
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
                <button
                  className={`range-button ${timeRange === '90d' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('90d')}
                >
                  90 Days
                </button>
              </div>
            </div>

            <div className="detail-stats">
              <div className="stat-box">
                <div className="stat-label">Average Daily Usage</div>
                <div className="stat-value">
                  {formatEnergy((selectedAppliance.powerRating / 1000) * 8)}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Power Rating</div>
                <div className="stat-value">
                  {formatPower(selectedAppliance.powerRating / 1000)}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Status</div>
                <div className="stat-value" style={{ color: getStatusColor(selectedAppliance.status) }}>
                  {selectedAppliance.status.toUpperCase()}
                </div>
              </div>
            </div>

            <EnergyUsageChart data={applianceData} timeRange={timeRange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Appliances;
