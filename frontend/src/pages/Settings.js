import React, { useState, useEffect } from 'react';
import { mockAppliances } from '../utils/mockData';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const [appliances] = useState(mockAppliances);
  const [timeSlotInfo, setTimeSlotInfo] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    // Fetch time slot info from RDF ontology
    fetchTimeSlotInfo();
  }, []);

  const fetchTimeSlotInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/optimization/timeslot');
      setTimeSlotInfo(response.data);
    } catch (error) {
      console.error('Error fetching time slot info:', error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // You can implement actual theme switching here
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings & Documentation</h1>
        <p className="page-subtitle">Configure your Smart Home Energy Tracker</p>
      </div>

      {/* Theme Settings */}
      <div className="settings-section">
        <h2 className="section-title">Appearance</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Theme Mode</div>
              <div className="setting-description">
                Switch between light and dark mode for comfortable viewing
              </div>
            </div>
            <button
              className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
              onClick={handleThemeToggle}
            >
              <span className="toggle-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="toggle-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appliance Configuration */}
      <div className="settings-section">
        <h2 className="section-title">Appliance Configuration</h2>
        <div className="settings-card">
          <p className="section-description">
            Current appliances being monitored and simulated in your smart home system
          </p>
          <div className="appliance-config-list">
            {appliances.map((appliance, index) => (
              <div key={appliance.id} className="config-appliance-item">
                <div className="appliance-number">{index + 1}</div>
                <div className="appliance-details">
                  <div className="appliance-name">{appliance.name}</div>
                  <div className="appliance-specs">
                    {appliance.type.replace('_', ' ')} • {(appliance.powerRating / 1000).toFixed(1)} kW
                  </div>
                </div>
                <div className="appliance-status-badge" data-status={appliance.status}>
                  {appliance.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase 3: RDF Ontology Status */}
      <div className="settings-section">
        <h2 className="section-title">🧠 Phase 3: Rule-Based Optimization (RDF Ontology)</h2>
        <div className="settings-card">
          <div className="phase3-intro">
            <p className="phase3-description">
              Your smart home system uses a <strong>semantic knowledge graph</strong> built with RDF (Resource Description Framework) 
              to provide intelligent, context-aware energy optimization suggestions based on time-of-use pricing.
            </p>
          </div>

          {timeSlotInfo && (
            <div className="timeslot-display">
              <div className="timeslot-header">
                <span className="timeslot-icon">⏰</span>
                <h3>Current Time Slot Analysis</h3>
              </div>
              
              <div className="timeslot-grid">
                <div className="timeslot-card current-slot">
                  <div className="card-label">Active Time Slot</div>
                  <div className="card-value">{timeSlotInfo.current_slot}</div>
                  <div className="card-meta">Current hour: {timeSlotInfo.current_hour}:00</div>
                </div>
                
                <div className="timeslot-card multiplier">
                  <div className="card-label">Cost Multiplier</div>
                  <div className="card-value cost-highlight">{timeSlotInfo.cost_multiplier}x</div>
                  <div className="card-meta">
                    {timeSlotInfo.cost_multiplier > 1.3 ? '🔴 High cost period' : 
                     timeSlotInfo.cost_multiplier > 1.0 ? '🟡 Medium cost' : '🟢 Low cost period'}
                  </div>
                </div>
                
                <div className="timeslot-card transition">
                  <div className="card-label">Next Transition</div>
                  <div className="card-value-sm">{timeSlotInfo.next_transition}</div>
                </div>
              </div>

              <div className="recommendation-box">
                <div className="rec-icon">💡</div>
                <div className="rec-content">
                  <div className="rec-label">Smart Recommendation</div>
                  <div className="rec-text">{timeSlotInfo.recommendation}</div>
                </div>
              </div>
            </div>
          )}

          <div className="ontology-details">
            <h4>Ontology Knowledge Base</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-icon">📚</span>
                <div>
                  <div className="detail-name">Triples Loaded</div>
                  <div className="detail-value">74 semantic relationships</div>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⚡</span>
                <div>
                  <div className="detail-name">Time Slots Defined</div>
                  <div className="detail-value">3 (Peak, Shoulder, Off-Peak)</div>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📋</span>
                <div>
                  <div className="detail-name">Optimization Rules</div>
                  <div className="detail-value">8 context-aware rules</div>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🔍</span>
                <div>
                  <div className="detail-name">Query Engine</div>
                  <div className="detail-value">SPARQL 1.1</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ontology-example">
            <h4>Example RDF Rule Structure</h4>
            <pre className="code-block">
{`:Rule1 a :OptimizationRule ;
    :appliesTo :PeakHours ;
    :ruleDescription "High energy usage during peak hours" ;
    :threshold "150" ;
    :impact "High" ;
    :category "Cost-Saving" .`}
            </pre>
          </div>
        </div>
      </div>

      {/* Phase 2: ML Model Status */}
      <div className="settings-section">
        <h2 className="section-title">🤖 Phase 2: Predictive Analytics (Machine Learning)</h2>
        <div className="settings-card">
          <div className="ml-intro">
            <p className="ml-description">
              Energy consumption forecasting powered by a <strong>Linear Regression model</strong> trained 
              on historical energy usage patterns with time-based features.
            </p>
          </div>

          <div className="ml-metrics">
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <div className="metric-label">Model Performance</div>
                <div className="metric-value">R² = 0.7425</div>
                <div className="metric-desc">74.25% variance explained</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-label">Algorithm</div>
                <div className="metric-value">Linear Regression</div>
                <div className="metric-desc">Scikit-learn 1.6.1</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-label">Features</div>
                <div className="metric-value">10 engineered features</div>
                <div className="metric-desc">Time + lag + rolling stats</div>
              </div>
            </div>
          </div>

          <div className="ml-features">
            <h4>Model Features Used</h4>
            <div className="feature-tags">
              <span className="feature-tag">Hour of Day</span>
              <span className="feature-tag">Day of Week</span>
              <span className="feature-tag">Weekend Flag</span>
              <span className="feature-tag">Time Category</span>
              <span className="feature-tag">Lag-1 Consumption</span>
              <span className="feature-tag">Lag-2 Consumption</span>
              <span className="feature-tag">Lag-3 Consumption</span>
              <span className="feature-tag">3h Rolling Mean</span>
              <span className="feature-tag">6h Rolling Mean</span>
              <span className="feature-tag">3h Rolling Std Dev</span>
            </div>
          </div>

          <div className="ml-output">
            <h4>Prediction Output</h4>
            <p>The model generates <strong>24-hour forecasts</strong> with hourly granularity, 
            helping you anticipate energy demand and optimize appliance scheduling.</p>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="settings-section">
        <h2 className="section-title">About This Project</h2>
        <div className="settings-card">
          <div className="about-content">
            <div className="about-header">
              <span className="about-icon">⚡</span>
              <h3 className="about-title">Smart Home Energy Tracker</h3>
              <span className="version-badge">v1.0.0 - Phase 3 Complete</span>
            </div>
            
            <div className="about-description">
              <p>
                A comprehensive energy monitoring and optimization system designed to help households
                track, analyze, and reduce their energy consumption through intelligent insights
                and actionable recommendations.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-name">Real-time Dashboard</div>
                <div className="feature-desc">Live energy consumption tracking</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔌</div>
                <div className="feature-name">Appliance Monitoring</div>
                <div className="feature-desc">Detailed usage analytics per device</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔮</div>
                <div className="feature-name">Predictive Modeling</div>
                <div className="feature-desc">AI-powered consumption forecasts</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💡</div>
                <div className="feature-name">Smart Optimization</div>
                <div className="feature-desc">Personalized energy-saving tips</div>
              </div>
            </div>

            <div className="tech-stack">
              <h4 className="tech-title">Technology Stack</h4>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Recharts</span>
                <span className="tech-tag">Flask</span>
                <span className="tech-tag">Python</span>
                <span className="tech-tag">Machine Learning</span>
              </div>
            </div>

            <div className="project-links">
              <h4 className="links-title">Project Resources</h4>
              <div className="links-list">
                <a href="https://github.com" className="project-link" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">📁</span>
                  <span className="link-text">GitHub Repository</span>
                  <span className="link-arrow">→</span>
                </a>
                <a href="#documentation" className="project-link">
                  <span className="link-icon">📖</span>
                  <span className="link-text">Documentation</span>
                  <span className="link-arrow">→</span>
                </a>
                <a href="#api" className="project-link">
                  <span className="link-icon">🔧</span>
                  <span className="link-text">API Reference</span>
                  <span className="link-arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="settings-section">
        <h2 className="section-title">System Information</h2>
        <div className="settings-card">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Frontend Version</div>
              <div className="info-value">1.0.0</div>
            </div>
            <div className="info-item">
              <div className="info-label">Last Updated</div>
              <div className="info-value">December 1, 2025</div>
            </div>
            <div className="info-item">
              <div className="info-label">API Status</div>
              <div className="info-value status-online">● Online</div>
            </div>
            <div className="info-item">
              <div className="info-label">Data Mode</div>
              <div className="info-value">Mock Data (Development)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <p>© 2025 Smart Home Energy Tracker. Built with ❤️ for sustainable living.</p>
      </div>
    </div>
  );
};

export default Settings;
