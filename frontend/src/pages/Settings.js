import React, { useState } from 'react';
import { mockAppliances } from '../utils/mockData';
import './Settings.css';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const [appliances] = useState(mockAppliances);

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

      {/* Project Information */}
      <div className="settings-section">
        <h2 className="section-title">About This Project</h2>
        <div className="settings-card">
          <div className="about-content">
            <div className="about-header">
              <span className="about-icon">⚡</span>
              <h3 className="about-title">Smart Home Energy Tracker</h3>
              <span className="version-badge">v1.0.0</span>
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
