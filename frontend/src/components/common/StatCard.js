import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  const getTrendClass = () => {
    if (!trend) return '';
    return trend.direction === 'up' ? 'trend-up' : 'trend-down';
  };

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-title">{title}</div>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      {trend && (
        <div className={`stat-card-trend ${getTrendClass()}`}>
          <span className="trend-icon">{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span className="trend-value">{trend.value}</span>
          <span className="trend-label">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
