import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

const EnergyUsageChart = ({ data, timeRange = '24h' }) => {
  const getTimeKey = () => {
    if (timeRange === '24h') return 'time';
    if (timeRange === '7d') return 'day';
    if (timeRange === '30d') return 'week';
    return 'time';
  };

  const formatTooltip = (value, name) => {
    if (name === 'consumption') return [`${value.toFixed(2)} kWh`, 'Consumption'];
    if (name === 'cost') return [`$${value.toFixed(2)}`, 'Cost'];
    if (name === 'predicted') return [`${value.toFixed(2)} kWh`, 'Predicted'];
    return [value, name];
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={getTimeKey()} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="consumption" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyUsageChart;
