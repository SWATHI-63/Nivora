import React, { useState, useMemo } from 'react';
import { useFinances, useGoals } from '../../hooks/useLocalStorage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [budgets] = useState(() => {
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

  // Chart.js configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    }
  };

  // Doughnut chart data for spending by category
  const doughnutData = {
    labels: topCategories.map(([cat]) => cat),
    datasets: [{
      data: topCategories.map(([, amount]) => amount),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(245, 158, 11)',
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)'
      ],
      borderWidth: 2
    }]
  };

  // Bar chart data for monthly trends
  const barData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2
      }
    ]
  };

  // Line chart for trend analysis
  const lineData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Net Savings',
        data: monthlyData.map(m => m.income - m.expense),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--text-secondary)',
          callback: (value) => '₹' + (value / 1000).toFixed(0) + 'k'
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'var(--text-secondary)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          color: 'var(--text-secondary)',
          callback: (value) => '₹' + (value / 1000).toFixed(0) + 'k'
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'var(--text-secondary)'
        },
        grid: {
          display: false
        }
      }
    }
  };

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
          <div className="chart-wrapper" style={{ height: '350px' }}>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="analytics-section">
        <h2 className="section-title">📈 Monthly Income vs Expenses</h2>
        <div className="chart-wrapper" style={{ height: '350px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Net Savings Trend */}
      <div className="analytics-section">
        <h2 className="section-title">💰 Net Savings Trend</h2>
        <div className="chart-wrapper" style={{ height: '300px' }}>
          <Line data={lineData} options={lineOptions} />
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
