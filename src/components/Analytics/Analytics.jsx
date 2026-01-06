import React, { useState, useMemo } from 'react';
import { useFinances, useGoals } from '../../hooks/useLocalStorage';
import './Analytics.css';

function Analytics() {
  const [finances] = useFinances();
  const [goals] = useGoals();
  // eslint-disable-next-line no-unused-vars
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  // eslint-disable-next-line no-unused-vars
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('nivora-budgets');
    return saved ? JSON.parse(saved) : {
      Food: 5000,
      Transport: 3000,
      Shopping: 4000,
      Entertainment: 2000,
      Bills: 8000,
      Other: 3000
    };
  });

  // Calculate category-wise expenses
  const expensesByCategory = useMemo(() => {
    const categoryTotals = {};
    finances
      .filter(f => f.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
      });
    return categoryTotals;
  }, [finances]);

  // Calculate monthly trends
  const monthlyData = useMemo(() => {
    const months = {};
    finances.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0, month: date.toLocaleString('default', { month: 'short' }) };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expense += transaction.amount;
      }
    });
    
    return Object.values(months).slice(-6);
  }, [finances]);

  // Calculate budget alerts
  const budgetAlerts = useMemo(() => {
    const alerts = [];
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const budget = budgets[category];
      if (budget && amount > budget) {
        alerts.push({
          category,
          spent: amount,
          budget,
          percentage: ((amount / budget) * 100).toFixed(0)
        });
      }
    });
    return alerts;
  }, [expensesByCategory, budgets]);

  // Goal deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return goals
      .filter(g => !g.completed && g.deadline)
      .map(g => ({
        ...g,
        daysLeft: Math.ceil((new Date(g.deadline) - now) / (1000 * 60 * 60 * 24))
      }))
      .filter(g => g.daysLeft >= 0 && g.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [goals]);

  // Calculate total expenses
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

  // Top spending categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxMonthlyAmount = Math.max(
    ...monthlyData.map(m => Math.max(m.income, m.expense)),
    1
  );

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">📊 Analytics & Insights</h1>
        <p className="analytics-subtitle">Track your financial patterns and trends</p>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="analytics-alerts">
          <h2 className="section-title">⚠️ Budget Alerts</h2>
          <div className="alerts-list">
            {budgetAlerts.map(alert => (
              <div key={alert.category} className="alert-card">
                <div className="alert-icon">🚨</div>
                <div className="alert-content">
                  <div className="alert-title">{alert.category} Budget Exceeded</div>
                  <div className="alert-details">
                    Spent ₹{alert.spent.toFixed(0)} of ₹{alert.budget.toFixed(0)} ({alert.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="analytics-section">
          <h2 className="section-title">⏰ Upcoming Goal Deadlines</h2>
          <div className="deadlines-list">
            {upcomingDeadlines.map(goal => (
              <div key={goal.id} className="deadline-card">
                <div className="deadline-icon">🎯</div>
                <div className="deadline-content">
                  <div className="deadline-title">{goal.name}</div>
                  <div className="deadline-date">
                    {goal.daysLeft === 0 ? 'Due today!' : `${goal.daysLeft} days left`}
                  </div>
                </div>
                <div className={`deadline-badge ${goal.daysLeft <= 7 ? 'urgent' : ''}`}>
                  {goal.daysLeft <= 7 ? 'Urgent' : 'Soon'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Breakdown Pie Chart */}
      <div className="analytics-section">
        <h2 className="section-title">🥧 Spending by Category</h2>
        <div className="chart-container">
          <div className="pie-chart-wrapper">
            <div className="pie-chart">
              {topCategories.map(([category, amount], index) => {
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
                return (
                  <div 
                    key={category}
                    className="pie-slice"
                    style={{
                      '--percentage': percentage,
                      '--color': colors[index % colors.length],
                      '--index': index
                    }}
                  />
                );
              })}
            </div>
            <div className="pie-chart-center">
              <div className="pie-chart-total">₹{totalExpenses.toFixed(0)}</div>
              <div className="pie-chart-label">Total</div>
            </div>
          </div>
          
          <div className="chart-legend">
            {topCategories.map(([category, amount], index) => {
              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
              const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
              return (
                <div key={category} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="legend-content">
                    <div className="legend-category">{category}</div>
                    <div className="legend-amount">₹{amount.toFixed(0)} ({percentage}%)</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="analytics-section">
        <h2 className="section-title">📈 Monthly Trends</h2>
        <div className="trends-chart">
          <div className="chart-bars">
            {monthlyData.map((month, index) => (
              <div key={index} className="chart-month">
                <div className="chart-bars-group">
                  <div 
                    className="chart-bar income"
                    style={{ height: `${(month.income / maxMonthlyAmount) * 100}%` }}
                    title={`Income: ₹${month.income.toFixed(0)}`}
                  >
                    <span className="bar-value">₹{(month.income / 1000).toFixed(0)}k</span>
                  </div>
                  <div 
                    className="chart-bar expense"
                    style={{ height: `${(month.expense / maxMonthlyAmount) * 100}%` }}
                    title={`Expense: ₹${month.expense.toFixed(0)}`}
                  >
                    <span className="bar-value">₹{(month.expense / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <div className="chart-month-label">{month.month}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend-horizontal">
            <div className="legend-item-h">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }} />
              <span>Income</span>
            </div>
            <div className="legend-item-h">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }} />
              <span>Expense</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Patterns */}
      <div className="analytics-section">
        <h2 className="section-title">💡 Spending Patterns</h2>
        <div className="patterns-grid">
          {Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const budget = budgets[category] || 0;
              const percentage = budget > 0 ? ((amount / budget) * 100).toFixed(0) : 0;
              const status = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good';
              
              return (
                <div key={category} className="pattern-card">
                  <div className="pattern-header">
                    <div className="pattern-category">{category}</div>
                    <div className={`pattern-status ${status}`}>
                      {status === 'over' ? '⚠️' : status === 'warning' ? '⚡' : '✓'}
                    </div>
                  </div>
                  <div className="pattern-amount">₹{amount.toFixed(0)}</div>
                  {budget > 0 && (
                    <>
                      <div className="pattern-budget">Budget: ₹{budget.toFixed(0)}</div>
                      <div className="pattern-progress">
                        <div 
                          className={`pattern-progress-fill ${status}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="pattern-percentage">{percentage}% used</div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="analytics-section">
        <h2 className="section-title">📊 Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{finances.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{goals.filter(g => !g.completed).length}</div>
            <div className="stat-label">Active Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{Object.keys(expensesByCategory).length}</div>
            <div className="stat-label">Categories Used</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">
              ₹{(finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0) / 1000).toFixed(1)}k
            </div>
            <div className="stat-label">Total Income</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
