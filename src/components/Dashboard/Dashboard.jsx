import React from 'react';
import { useFinances, useGoals, useTasks } from '../../hooks/useLocalStorage';
import './Dashboard.css';

function Dashboard() {
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [tasks] = useTasks();

  // Calculate financial summary
  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalExpenses = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  // Get active goals
  const activeGoals = goals.filter(g => !g.completed).slice(0, 3);

  // Get this week's tasks
  const weekTasks = tasks.slice(0, 5);
  const completedTasks = weekTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back! 👋</h1>
        <p className="dashboard-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Current Balance</div>
              <div className="stat-value">
                ₹{balance.toFixed(2)}
              </div>
            </div>
            <div className="stat-icon">💵</div>
          </div>
          <div className={`stat-trend ${balance >= 0 ? 'trend-positive' : 'trend-negative'}`}>
            {balance >= 0 ? '↗' : '↘'} {balance >= 0 ? 'Positive' : 'Negative'} Balance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Active Goals</div>
              <div className="stat-value">{activeGoals.length}</div>
            </div>
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-trend">
            {goals.filter(g => g.completed).length} completed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Weekly Tasks</div>
              <div className="stat-value">
                {completedTasks}/{weekTasks.length}
              </div>
            </div>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-trend trend-positive">
            {weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0}% Complete
          </div>
        </div>
      </div>

      <div className="quick-view-card">
        <h2 className="section-title">🎯 Top Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="quick-goals-list">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="quick-goal-item">
                <div className="item-info">
                  <div className="item-title">{goal.title}</div>
                  <div className="item-meta">
                    Priority: {goal.priority} • ₹{goal.currentAmount} / ₹{goal.targetAmount}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(goal.currentAmount / goal.targetAmount) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p>No active goals. Start by creating your first goal!</p>
          </div>
        )}
      </div>

      <div className="quick-view-card">
        <h2 className="section-title">✓ Recent Tasks</h2>
        {weekTasks.length > 0 ? (
          <div className="quick-tasks-list">
            {weekTasks.map((task) => (
              <div key={task.id} className="quick-task-item">
                <div className="item-info">
                  <div className="item-title">{task.title}</div>
                  <div className="item-meta">{task.date}</div>
                </div>
                <span className={`task-status ${task.status}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
