import React, { useState, useEffect } from 'react';
import { getOptimizationSuggestions, updateSuggestionStatus } from '../services/api';
import { mockOptimizationSuggestions } from '../utils/mockData';
import { formatCurrency, getPriorityColor } from '../utils/formatters';
import './Optimization.css';

const Optimization = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [useMockData] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        setSuggestions(mockOptimizationSuggestions);
      } else {
        const data = await getOptimizationSuggestions();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions(mockOptimizationSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (suggestionId, newStatus) => {
    try {
      if (!useMockData) {
        await updateSuggestionStatus(suggestionId, newStatus);
      }
      
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      console.error('Error updating suggestion status:', error);
    }
  };

  const getFilteredSuggestions = () => {
    if (filter === 'all') return suggestions;
    if (filter === 'pending') return suggestions.filter(s => s.status === 'pending');
    if (filter === 'completed') return suggestions.filter(s => s.status === 'completed');
    return suggestions.filter(s => s.priority === filter);
  };

  const calculateTotalSavings = () => {
    const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
    const totalEnergy = pendingSuggestions.reduce((sum, s) => {
      const match = s.impact.energySaving.match(/[\d.]+/);
      return sum + (match ? parseFloat(match[0]) : 0);
    }, 0);
    const totalCost = pendingSuggestions.reduce((sum, s) => {
      const match = s.impact.costSaving.match(/[\d.]+/);
      return sum + (match ? parseFloat(match[0]) : 0);
    }, 0);
    return { totalEnergy, totalCost };
  };

  const filteredSuggestions = getFilteredSuggestions();
  const { totalEnergy, totalCost } = calculateTotalSavings();

  if (loading) {
    return (
      <div className="optimization-page">
        <div className="loading-spinner">Loading optimization suggestions...</div>
      </div>
    );
  }

  return (
    <div className="optimization-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Energy Optimization</h1>
          <p className="page-subtitle">Actionable recommendations to reduce energy consumption and costs</p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="savings-summary">
        <div className="summary-card">
          <div className="summary-icon">💡</div>
          <div className="summary-content">
            <div className="summary-label">Total Potential Savings</div>
            <div className="summary-value">{formatCurrency(totalCost)}/day</div>
            <div className="summary-subtext">{totalEnergy.toFixed(1)} kWh/day</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📋</div>
          <div className="summary-content">
            <div className="summary-label">Active Suggestions</div>
            <div className="summary-value">{suggestions.filter(s => s.status === 'pending').length}</div>
            <div className="summary-subtext">Ready to implement</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-label">Completed Actions</div>
            <div className="summary-value">{suggestions.filter(s => s.status === 'completed').length}</div>
            <div className="summary-subtext">Already implemented</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Suggestions
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Priority
          </button>
          <button
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium Priority
          </button>
          <button
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low Priority
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="suggestions-list">
        {filteredSuggestions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No suggestions found</h3>
            <p>You're all caught up! Check back later for new optimization opportunities.</p>
          </div>
        ) : (
          filteredSuggestions
            .sort((a, b) => b.impact.score - a.impact.score)
            .map(suggestion => (
              <div
                key={suggestion.id}
                className={`suggestion-card ${suggestion.status}`}
              >
                <div className="suggestion-header">
                  <div className="suggestion-title-area">
                    <h3 className="suggestion-title">{suggestion.title}</h3>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                    >
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <div className="impact-score">
                    <div className="score-value">{suggestion.impact.score.toFixed(1)}</div>
                    <div className="score-label">Impact Score</div>
                  </div>
                </div>

                <p className="suggestion-description">{suggestion.description}</p>

                <div className="impact-details">
                  <div className="impact-item">
                    <div className="impact-icon">⚡</div>
                    <div>
                      <div className="impact-label">Energy Saving</div>
                      <div className="impact-value">{suggestion.impact.energySaving}</div>
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">💰</div>
                    <div>
                      <div className="impact-label">Cost Saving</div>
                      <div className="impact-value">{suggestion.impact.costSaving}</div>
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🏷️</div>
                    <div>
                      <div className="impact-label">Rule Type</div>
                      <div className="impact-value">{suggestion.rule.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                <div className="suggestion-actions">
                  {suggestion.status === 'pending' ? (
                    <>
                      <button
                        className="action-btn complete-btn"
                        onClick={() => handleStatusUpdate(suggestion.id, 'completed')}
                      >
                        ✓ Mark as Complete
                      </button>
                      <button
                        className="action-btn dismiss-btn"
                        onClick={() => handleStatusUpdate(suggestion.id, 'dismissed')}
                      >
                        ✕ Dismiss
                      </button>
                      <button className="action-btn explain-btn">
                        ℹ️ Explain Rule
                      </button>
                    </>
                  ) : (
                    <div className="status-indicator">
                      {suggestion.status === 'completed' ? '✅ Completed' : '🚫 Dismissed'}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Optimization;
