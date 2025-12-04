import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Simulator.css';

const Simulator = () => {
  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [simulationHours, setSimulationHours] = useState(24);
  const [usagePattern, setUsagePattern] = useState('normal'); // normal, peak, offpeak
  const [predictions, setPredictions] = useState(null);
  const [customUsage, setCustomUsage] = useState({
    hourlyKwh: 0.2,
    peakMultiplier: 1.5,
    offPeakMultiplier: 0.8
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeSlotInfo, setTimeSlotInfo] = useState(null);

  useEffect(() => {
    loadAppliances();
    loadTimeSlotInfo();
  }, []);

  const loadAppliances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appliances');
      setAppliances(response.data);
      if (response.data.length > 0) {
        setSelectedAppliance(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading appliances:', error);
      // Fallback to appliances from ontology if API fails
      const ontologyAppliances = [
        { id: 1, name: 'HVAC System', type: 'heating_cooling', powerRating: 3500, status: 'active' },
        { id: 2, name: 'Electric Water Heater', type: 'appliance', powerRating: 4500, status: 'active' },
        { id: 3, name: 'Washing Machine', type: 'appliance', powerRating: 500, status: 'idle' },
        { id: 4, name: 'Dishwasher', type: 'appliance', powerRating: 1800, status: 'idle' },
        { id: 5, name: 'Electric Vehicle', type: 'vehicle', powerRating: 7200, status: 'idle' },
        { id: 6, name: 'Pool Pump', type: 'appliance', powerRating: 1500, status: 'idle' },
        { id: 7, name: 'Battery Storage', type: 'storage', powerRating: 5000, status: 'active' },
        { id: 8, name: 'Refrigerator', type: 'appliance', powerRating: 150, status: 'active' }
      ];
      setAppliances(ontologyAppliances);
      setSelectedAppliance(ontologyAppliances[0].id);
    }
  };

  const loadTimeSlotInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/optimization/timeslot');
      setTimeSlotInfo(response.data);
    } catch (error) {
      console.error('Error loading time slot info:', error);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      // Get predictions from ML model
      const predResponse = await axios.get(`http://localhost:5000/api/predictions?hours=${simulationHours}`);
      setPredictions(predResponse.data);

      // Generate simulation data based on pattern
      const simulatedData = generateSimulationData(predResponse.data.next24Hours);
      
      // Calculate costs and savings
      const analysis = analyzeSimulation(simulatedData);
      
      setSimulationResult(analysis);
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulationData = (predictions) => {
    return predictions.map((pred, index) => {
      const hour = parseInt(pred.time.split(':')[0]);
      let multiplier = 1.0;
      let timeSlot = 'Shoulder';
      
      // Determine time slot and multiplier
      if (hour >= 17 && hour < 21) {
        timeSlot = 'Peak';
        multiplier = 1.5;
      } else if (hour >= 7 && hour < 17) {
        timeSlot = 'Shoulder';
        multiplier = 1.2;
      } else {
        timeSlot = 'Off-Peak';
        multiplier = 1.0;
      }

      // Apply usage pattern
      let adjustedConsumption = pred.predicted;
      if (usagePattern === 'peak') {
        adjustedConsumption = hour >= 17 && hour < 21 ? pred.predicted : pred.predicted * 0.5;
      } else if (usagePattern === 'offpeak') {
        adjustedConsumption = hour < 7 || hour >= 21 ? pred.predicted : pred.predicted * 0.5;
      }

      const cost = adjustedConsumption * 0.12 * multiplier;

      return {
        hour: pred.time,
        predicted: pred.predicted,
        simulated: adjustedConsumption,
        cost: cost,
        timeSlot: timeSlot,
        multiplier: multiplier
      };
    });
  };

  const analyzeSimulation = (data) => {
    const totalPredicted = data.reduce((sum, d) => sum + d.predicted, 0);
    const totalSimulated = data.reduce((sum, d) => sum + d.simulated, 0);
    const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
    
    // Calculate potential savings by shifting to off-peak
    const peakUsage = data.filter(d => d.timeSlot === 'Peak').reduce((sum, d) => sum + d.simulated, 0);
    const potentialSavings = peakUsage * 0.12 * 0.5; // 50% cost reduction if shifted

    // Calculate by time slot
    const byTimeSlot = {
      'Peak': { energy: 0, cost: 0, hours: 0 },
      'Shoulder': { energy: 0, cost: 0, hours: 0 },
      'Off-Peak': { energy: 0, cost: 0, hours: 0 }
    };

    data.forEach(d => {
      byTimeSlot[d.timeSlot].energy += d.simulated;
      byTimeSlot[d.timeSlot].cost += d.cost;
      byTimeSlot[d.timeSlot].hours += 1;
    });

    return {
      data: data,
      totals: {
        predictedEnergy: totalPredicted.toFixed(2),
        simulatedEnergy: totalSimulated.toFixed(2),
        totalCost: totalCost.toFixed(2),
        potentialSavings: potentialSavings.toFixed(2),
        difference: (totalSimulated - totalPredicted).toFixed(2)
      },
      byTimeSlot: byTimeSlot
    };
  };

  const getPatternIcon = (pattern) => {
    switch(pattern) {
      case 'normal': return '📊';
      case 'peak': return '🔴';
      case 'offpeak': return '🟢';
      default: return '📊';
    }
  };

  return (
    <div className="simulator-page">
      <div className="page-header">
        <h1 className="page-title">⚡ Energy Usage Simulator</h1>
        <p className="page-subtitle">
          Simulate and predict energy consumption patterns using ML models and RDF ontology
        </p>
      </div>

      {/* Current Time Slot Info */}
      {timeSlotInfo && (
        <div className="timeslot-banner">
          <div className="banner-content">
            <span className="banner-icon">⏰</span>
            <div className="banner-text">
              <strong>Current Time Slot:</strong> {timeSlotInfo.current_slot} 
              <span className="cost-badge">({timeSlotInfo.cost_multiplier}x cost)</span>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Controls */}
      <div className="simulator-controls">
        <h2 className="section-title">Simulation Settings</h2>
        
        <div className="control-grid">
          {/* Appliance Selection */}
          <div className="control-group">
            <label className="control-label">Select Appliance</label>
            <select 
              className="control-select"
              value={selectedAppliance || ''}
              onChange={(e) => setSelectedAppliance(e.target.value ? parseInt(e.target.value) : null)}
            >
              {appliances.length === 0 ? (
                <option value="">Loading appliances...</option>
              ) : (
                <>
                  <option value="">-- Select an appliance --</option>
                  {appliances.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({(app.powerRating / 1000).toFixed(1)} kW)
                    </option>
                  ))}
                </>
              )}
            </select>
            {appliances.length > 0 && !selectedAppliance && (
              <div className="control-helper">Choose an appliance to simulate energy usage</div>
            )}
          </div>

          {/* Simulation Duration */}
          <div className="control-group">
            <label className="control-label">Simulation Duration (hours)</label>
            <input
              type="range"
              min="6"
              max="48"
              value={simulationHours}
              onChange={(e) => setSimulationHours(parseInt(e.target.value))}
              className="control-slider"
            />
            <div className="slider-value">{simulationHours} hours</div>
          </div>

          {/* Usage Pattern */}
          <div className="control-group">
            <label className="control-label">Usage Pattern</label>
            <div className="pattern-buttons">
              {['normal', 'peak', 'offpeak'].map(pattern => (
                <button
                  key={pattern}
                  className={`pattern-btn ${usagePattern === pattern ? 'active' : ''}`}
                  onClick={() => setUsagePattern(pattern)}
                >
                  <span className="pattern-icon">{getPatternIcon(pattern)}</span>
                  {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('offpeak', 'Off-Peak')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Run Simulation Button */}
        <button 
          className="run-simulation-btn"
          onClick={runSimulation}
          disabled={loading || !selectedAppliance}
        >
          {loading ? '⚙️ Running Simulation...' : '🚀 Run Simulation'}
        </button>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="simulation-results">
          <h2 className="section-title">Simulation Results</h2>

          {/* Summary Cards */}
          <div className="results-summary">
            <div className="summary-card">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <div className="card-label">Total Energy (Simulated)</div>
                <div className="card-value">{simulationResult.totals.simulatedEnergy} kWh</div>
                <div className="card-meta">
                  ML Predicted: {simulationResult.totals.predictedEnergy} kWh
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-label">Total Cost</div>
                <div className="card-value">${simulationResult.totals.totalCost}</div>
                <div className="card-meta">Based on time-of-use pricing</div>
              </div>
            </div>

            <div className="summary-card savings">
              <div className="card-icon">💡</div>
              <div className="card-content">
                <div className="card-label">Potential Savings</div>
                <div className="card-value">${simulationResult.totals.potentialSavings}</div>
                <div className="card-meta">By shifting to off-peak hours</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-label">Difference</div>
                <div className="card-value">
                  {parseFloat(simulationResult.totals.difference) >= 0 ? '+' : ''}
                  {simulationResult.totals.difference} kWh
                </div>
                <div className="card-meta">Simulated vs Predicted</div>
              </div>
            </div>
          </div>

          {/* Time Slot Breakdown */}
          <div className="timeslot-breakdown">
            <h3>Energy Usage by Time Slot</h3>
            <div className="breakdown-grid">
              {Object.entries(simulationResult.byTimeSlot).map(([slot, data]) => (
                <div key={slot} className={`breakdown-card slot-${slot.toLowerCase().replace('-', '')}`}>
                  <div className="breakdown-header">
                    <span className="slot-name">{slot}</span>
                    <span className="slot-hours">{data.hours} hours</span>
                  </div>
                  <div className="breakdown-stats">
                    <div className="stat-item">
                      <span className="stat-label">Energy</span>
                      <span className="stat-value">{data.energy.toFixed(2)} kWh</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Cost</span>
                      <span className="stat-value">${data.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="charts-container">
            {/* Energy Consumption Chart */}
            <div className="chart-card">
              <h3>Energy Consumption Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationResult.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="ML Predicted" strokeWidth={2} />
                  <Line type="monotone" dataKey="simulated" stroke="#82ca9d" name="Simulated" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost by Hour Chart */}
            <div className="chart-card">
              <h3>Cost by Hour (Time-of-Use Pricing)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={simulationResult.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis label={{ value: '$', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" fill="#fbbf24" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-box">
            <h3>💡 Smart Recommendations</h3>
            <ul className="recommendations-list">
              <li>
                <strong>Peak Usage:</strong> You consumed {simulationResult.byTimeSlot['Peak'].energy.toFixed(2)} kWh 
                during peak hours. Consider shifting heavy appliances to off-peak times.
              </li>
              <li>
                <strong>Cost Optimization:</strong> By moving just 50% of peak usage to off-peak hours, 
                you could save approximately ${simulationResult.totals.potentialSavings}.
              </li>
              <li>
                <strong>Best Times to Run Appliances:</strong> 
                {timeSlotInfo && (
                  <span> Current recommendation: {timeSlotInfo.recommendation}</span>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="info-panel">
        <h3>ℹ️ How This Works</h3>
        <div className="info-content">
          <div className="info-item">
            <strong>ML Predictions:</strong> Uses your trained Linear Regression model to forecast energy consumption 
            based on historical patterns, time of day, and day of week.
          </div>
          <div className="info-item">
            <strong>RDF Ontology:</strong> Applies time-of-use pricing rules from your semantic knowledge graph 
            to calculate costs and provide context-aware recommendations.
          </div>
          <div className="info-item">
            <strong>Simulation Patterns:</strong>
            <ul>
              <li><strong>Normal:</strong> Typical usage pattern throughout the day</li>
              <li><strong>Peak:</strong> Concentrate usage during peak hours (5 PM - 9 PM)</li>
              <li><strong>Off-Peak:</strong> Shift usage to off-peak hours (9 PM - 7 AM)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
