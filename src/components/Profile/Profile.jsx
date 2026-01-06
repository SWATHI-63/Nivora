import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { useTheme } from '../../context/ThemeContext';
import { useFinances, useGoals, useTasks, useNotes, useStreaks } from '../../hooks/useLocalStorage';
import './Profile.css';

function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [tasks] = useTasks();
  const [notes] = useNotes();
  const [streaks] = useStreaks();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.bio || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = updateProfile({ photo: reader.result });
        if (result.success) {
          setMessage({ type: 'success', text: 'Profile photo updated!' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setMessage({ type: 'error', text: 'Cover image size should be less than 5MB' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = updateProfile({ coverPhoto: reader.result });
        if (result.success) {
          setMessage({ type: 'success', text: 'Cover photo updated!' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBioSave = () => {
    if (bioText.length > 200) {
      setMessage({ type: 'error', text: 'Bio must be 200 characters or less!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    const result = updateProfile({ bio: bioText });
    if (result.success) {
      setIsEditingBio(false);
      setMessage({ type: 'success', text: 'Bio updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleRemovePhoto = () => {
    updateProfile({ photo: null });
    setMessage({ type: 'success', text: 'Photo removed!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Calculate stats
  const totalIncome = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const balance = totalIncome - totalExpenses;
  const completedGoals = goals.filter(g => g.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  // Analytics calculations
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

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxMonthlyAmount = Math.max(
    ...monthlyData.map(m => Math.max(m.income, m.expense)),
    1
  );

  // Recent activities
  const recentActivities = [
    ...finances.slice(-5).map((f) => ({
      id: `finance-${f.id}`,
      title: `${f.type === 'income' ? 'Received' : 'Spent'} ₹${f.amount}`,
      subtitle: f.category,
      date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: f.type === 'income' ? '💰' : '💸',
      color: f.type === 'income' ? '#10b981' : '#ef4444',
    })),
    ...goals.slice(-3).map((g) => ({
      id: `goal-${g.id}`,
      title: g.name,
      subtitle: `${Math.round((g.currentAmount / g.targetAmount) * 100)}% progress`,
      date: 'Goal',
      icon: '🎯',
      color: '#8b5cf6',
    })),
    ...tasks.slice(-3).map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: t.completed ? 'Completed' : 'In Progress',
      date: new Date(t.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: '✓',
      color: '#06b6d4',
    })),
  ].slice(0, 6);

  // Achievement badges - More comprehensive
  const achievements = [
    // Getting Started
    { icon: '🚀', label: 'First Step', description: 'Created first goal', unlocked: goals.length > 0, category: 'starter' },
    { icon: '💸', label: 'Tracker', description: 'First transaction', unlocked: finances.length > 0, category: 'starter' },
    { icon: '📝', label: 'Noted', description: 'First note created', unlocked: notes.length > 0, category: 'starter' },
    { icon: '✅', label: 'Task Master', description: 'First task added', unlocked: tasks.length > 0, category: 'starter' },
    
    // Savings Milestones
    { icon: '💰', label: 'Penny Saver', description: 'Balance > ₹1,000', unlocked: balance > 1000, category: 'savings' },
    { icon: '💎', label: 'Smart Saver', description: 'Balance > ₹10,000', unlocked: balance > 10000, category: 'savings' },
    { icon: '🏦', label: 'Bank Boss', description: 'Balance > ₹50,000', unlocked: balance > 50000, category: 'savings' },
    { icon: '🤑', label: 'Wealth Builder', description: 'Balance > ₹1,00,000', unlocked: balance > 100000, category: 'savings' },
    
    // Goal Achievements
    { icon: '🎯', label: 'Goal Getter', description: 'Complete 1 goal', unlocked: completedGoals >= 1, category: 'goals' },
    { icon: '🏆', label: 'Achiever', description: 'Complete 3 goals', unlocked: completedGoals >= 3, category: 'goals' },
    { icon: '👑', label: 'Goal Master', description: 'Complete 5 goals', unlocked: completedGoals >= 5, category: 'goals' },
    { icon: '🌟', label: 'Unstoppable', description: 'Complete 10 goals', unlocked: completedGoals >= 10, category: 'goals' },
    
    // Task Achievements  
    { icon: '⚡', label: 'Productive', description: 'Complete 10 tasks', unlocked: completedTasks >= 10, category: 'tasks' },
    { icon: '🔥', label: 'On Fire', description: 'Complete 25 tasks', unlocked: completedTasks >= 25, category: 'tasks' },
    { icon: '💪', label: 'Powerhouse', description: 'Complete 50 tasks', unlocked: completedTasks >= 50, category: 'tasks' },
    { icon: '🎖️', label: 'Task Legend', description: 'Complete 100 tasks', unlocked: completedTasks >= 100, category: 'tasks' },
    
    // Streak Achievements
    { icon: '📅', label: 'Getting Started', description: '3-day streak', unlocked: streaks.currentStreak >= 3, category: 'streaks' },
    { icon: '🔥', label: 'Week Warrior', description: '7-day streak', unlocked: streaks.currentStreak >= 7, category: 'streaks' },
    { icon: '⚡', label: 'Streak Master', description: '14-day streak', unlocked: streaks.currentStreak >= 14, category: 'streaks' },
    { icon: '🌈', label: 'Month Champion', description: '30-day streak', unlocked: streaks.currentStreak >= 30, category: 'streaks' },
    
    // Activity Achievements
    { icon: '📊', label: 'Data Lover', description: '20+ transactions', unlocked: finances.length >= 20, category: 'activity' },
    { icon: '📈', label: 'Analyst', description: '50+ transactions', unlocked: finances.length >= 50, category: 'activity' },
    { icon: '🧠', label: 'Note Taker', description: '10+ notes', unlocked: notes.length >= 10, category: 'activity' },
    { icon: '🌟', label: 'Superstar', description: 'All-rounder', unlocked: completedGoals >= 5 && completedTasks >= 20 && streaks.currentStreak >= 7, category: 'special' },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="profile-wrapper">
      {message.text && (
        <div className={`profile-toast profile-toast-${message.type}`}>
          <span className="profile-toast-icon">{message.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Cover Section */}
      <div className="profile-cover-section">
        <div className="profile-cover" style={{
          backgroundImage: currentUser.coverPhoto ? `url(${currentUser.coverPhoto})` : undefined
        }}>
          <div className="profile-cover-gradient"></div>
          <button className="profile-cover-edit" onClick={() => coverInputRef.current?.click()}>
            <span>📷</span> Edit Cover
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="profile-header-content">
          <div className="profile-avatar-container">
            <div className="profile-avatar-ring">
              {currentUser.photo ? (
                <img src={currentUser.photo} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-avatar-actions">
              <button className="profile-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                📷
              </button>
              {currentUser.photo && (
                <button className="profile-avatar-btn remove" onClick={handleRemovePhoto}>
                  ✕
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div className="profile-info">
            <h1 className="profile-user-name">{currentUser.name}</h1>
            <p className="profile-user-email">{currentUser.email}</p>
            
            {isEditingBio ? (
              <div className="profile-bio-editor">
                <textarea
                  className="profile-bio-textarea"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Share something about yourself..."
                  maxLength={200}
                  rows={2}
                />
                <div className="profile-bio-actions">
                  <button className="profile-bio-btn save" onClick={handleBioSave}>Save</button>
                  <button className="profile-bio-btn cancel" onClick={() => {
                    setIsEditingBio(false);
                    setBioText(currentUser.bio || '');
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-bio-display" onClick={() => setIsEditingBio(true)}>
                {currentUser.bio ? (
                  <p className="profile-bio-text">"{currentUser.bio}"</p>
                ) : (
                  <p className="profile-bio-empty">✏️ Add a bio</p>
                )}
              </div>
            )}
          </div>

          <div className="profile-quick-stats">
            <div className="profile-quick-stat">
              <div className="profile-quick-stat-value">{finances.length}</div>
              <div className="profile-quick-stat-label">Transactions</div>
            </div>
            <div className="profile-quick-stat">
              <div className="profile-quick-stat-value">{goals.length}</div>
              <div className="profile-quick-stat-label">Goals</div>
            </div>
            <div className="profile-quick-stat">
              <div className="profile-quick-stat-value">{tasks.length}</div>
              <div className="profile-quick-stat-label">Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>📊</span> Overview
        </button>
        <button 
          className={`profile-tab ${activeTab === 'streaks' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaks')}
        >
          <span>🔥</span> Streaks
        </button>
        <button 
          className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span>🏆</span> Achievements
        </button>
        <button 
          className={`profile-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span>📈</span> Analytics
        </button>
      </div>

      {/* Content Area */}
      <div className="profile-content-area">
        {activeTab === 'overview' && (
          <div className="profile-tab-content">
            {/* Financial Overview */}
            <div className="profile-section">
              <h2 className="profile-section-title">💰 Financial Overview</h2>
              <div className="profile-stats-grid">
                <div className="profile-stat-card income">
                  <div className="profile-stat-icon-wrapper">
                    <span className="profile-stat-icon">📈</span>
                  </div>
                  <div className="profile-stat-info">
                    <div className="profile-stat-label">Total Income</div>
                    <div className="profile-stat-value">₹{totalIncome.toFixed(2)}</div>
                  </div>
                </div>
                <div className="profile-stat-card expense">
                  <div className="profile-stat-icon-wrapper">
                    <span className="profile-stat-icon">📉</span>
                  </div>
                  <div className="profile-stat-info">
                    <div className="profile-stat-label">Total Expenses</div>
                    <div className="profile-stat-value">₹{totalExpenses.toFixed(2)}</div>
                  </div>
                </div>
                <div className="profile-stat-card balance">
                  <div className="profile-stat-icon-wrapper">
                    <span className="profile-stat-icon">💵</span>
                  </div>
                  <div className="profile-stat-info">
                    <div className="profile-stat-label">Balance</div>
                    <div className="profile-stat-value">₹{balance.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="profile-section">
              <h2 className="profile-section-title">🎯 Progress Overview</h2>
              <div className="profile-progress-grid">
                <div className="profile-progress-card">
                  <div className="profile-progress-header">
                    <span className="profile-progress-icon">🎯</span>
                    <span className="profile-progress-title">Goals</span>
                  </div>
                  <div className="profile-progress-bar">
                    <div 
                      className="profile-progress-fill goals"
                      style={{ width: `${goals.length > 0 ? (completedGoals / goals.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="profile-progress-text">
                    {completedGoals} of {goals.length} completed
                  </div>
                </div>
                <div className="profile-progress-card">
                  <div className="profile-progress-header">
                    <span className="profile-progress-icon">✓</span>
                    <span className="profile-progress-title">Tasks</span>
                  </div>
                  <div className="profile-progress-bar">
                    <div 
                      className="profile-progress-fill tasks"
                      style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="profile-progress-text">
                    {completedTasks} of {tasks.length} completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="profile-tab-content">
            {/* Streak Stats */}
            <div className="profile-section">
              <h2 className="profile-section-title">🔥 Your Streaks</h2>
              <div className="profile-streak-stats">
                <div className="profile-streak-card current">
                  <div className="profile-streak-flame">🔥</div>
                  <div className="profile-streak-value">{streaks.currentStreak}</div>
                  <div className="profile-streak-label">Current Streak</div>
                </div>
                <div className="profile-streak-card best">
                  <div className="profile-streak-flame">🏆</div>
                  <div className="profile-streak-value">{streaks.longestStreak}</div>
                  <div className="profile-streak-label">Longest Streak</div>
                </div>
                <div className="profile-streak-card total">
                  <div className="profile-streak-flame">📅</div>
                  <div className="profile-streak-value">{streaks.totalActiveDays}</div>
                  <div className="profile-streak-label">Total Active Days</div>
                </div>
              </div>
            </div>

            {/* Streak Calendar */}
            <div className="profile-section">
              <h2 className="profile-section-title">📅 Activity Calendar (Last 30 Days)</h2>
              <div className="profile-streak-calendar">
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (29 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const isActive = streaks.streakHistory?.includes(dateStr);
                  return (
                    <div 
                      key={i}
                      className={`profile-calendar-day ${isActive ? 'active' : ''}`}
                      title={date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    >
                      <span className="calendar-day-number">{date.getDate()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="profile-calendar-legend">
                <span className="legend-item"><span className="legend-inactive"></span> Inactive</span>
                <span className="legend-item"><span className="legend-active"></span> Active</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-section">
              <h2 className="profile-section-title">⚡ Recent Activity</h2>
              <div className="profile-activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="profile-activity-item">
                      <div className="profile-activity-icon" style={{ backgroundColor: activity.color }}>
                        {activity.icon}
                      </div>
                      <div className="profile-activity-content">
                        <div className="profile-activity-title">{activity.title}</div>
                        <div className="profile-activity-subtitle">{activity.subtitle}</div>
                      </div>
                      <div className="profile-activity-date">{activity.date}</div>
                    </div>
                  ))
                ) : (
                  <div className="profile-empty-state">
                    <span className="profile-empty-icon">📭</span>
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h2 className="profile-section-title">🏆 Achievements ({unlockedCount}/{achievements.length})</h2>
              <div className="profile-achievement-progress">
                <div 
                  className="profile-achievement-progress-fill"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                ></div>
              </div>
              <p className="profile-achievement-progress-text">
                {unlockedCount} of {achievements.length} badges unlocked
              </p>
            </div>

            {/* Group achievements by category */}
            {['starter', 'savings', 'goals', 'tasks', 'streaks', 'activity', 'special'].map(category => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const categoryLabels = {
                starter: '🚀 Getting Started',
                savings: '💰 Savings Milestones',
                goals: '🎯 Goal Achievements',
                tasks: '✅ Task Achievements',
                streaks: '🔥 Streak Achievements',
                activity: '📊 Activity Achievements',
                special: '🌟 Special Achievements'
              };
              
              return (
                <div key={category} className="profile-section">
                  <h2 className="profile-section-title">{categoryLabels[category]}</h2>
                  <div className="profile-achievements-grid">
                    {categoryAchievements.map((achievement, index) => (
                      <div 
                        key={index}
                        className={`profile-achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        title={achievement.description}
                      >
                        <div className="profile-achievement-icon">{achievement.icon}</div>
                        <div className="profile-achievement-info">
                          <div className="profile-achievement-label">{achievement.label}</div>
                          <div className="profile-achievement-desc">{achievement.description}</div>
                        </div>
                        {achievement.unlocked && <div className="profile-achievement-badge">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Logout Section */}
            <div className="profile-section">
              <h2 className="profile-section-title">⚙️ Account Settings</h2>
              <button className="profile-logout-btn" onClick={logout}>
                <span className="profile-logout-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="profile-tab-content">
            {/* Spending by Category */}
            <div className="profile-section">
              <h2 className="profile-section-title">🥧 Spending by Category</h2>
              {topCategories.length > 0 ? (
                <div className="profile-analytics-chart">
                  <div className="profile-pie-wrapper">
                    <div className="profile-pie-chart">
                      {topCategories.map(([category, amount], index) => {
                        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                        const colors = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];
                        return (
                          <div 
                            key={category}
                            className="profile-pie-segment"
                            style={{
                              '--percentage': percentage,
                              '--color': colors[index % colors.length],
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="profile-pie-center">
                      <div className="profile-pie-total">₹{totalExpenses.toFixed(0)}</div>
                      <div className="profile-pie-label">Total Spent</div>
                    </div>
                  </div>
                  
                  <div className="profile-chart-legend">
                    {topCategories.map(([category, amount], index) => {
                      const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                      const colors = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];
                      return (
                        <div key={category} className="profile-legend-item">
                          <div 
                            className="profile-legend-color" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <div className="profile-legend-content">
                            <div className="profile-legend-category">{category}</div>
                            <div className="profile-legend-amount">₹{amount.toFixed(0)} ({percentage}%)</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="profile-empty-state">
                  <span className="profile-empty-icon">📊</span>
                  <p>No expense data yet</p>
                </div>
              )}
            </div>

            {/* Monthly Trends */}
            <div className="profile-section">
              <h2 className="profile-section-title">📈 Monthly Trends</h2>
              {monthlyData.length > 0 ? (
                <div className="profile-trends-chart">
                  <div className="profile-chart-bars">
                    {monthlyData.map((month, index) => (
                      <div key={index} className="profile-chart-month">
                        <div className="profile-bars-group">
                          <div 
                            className="profile-bar income"
                            style={{ height: `${(month.income / maxMonthlyAmount) * 100}%` }}
                            title={`Income: ₹${month.income.toFixed(0)}`}
                          >
                            <span className="profile-bar-value">₹{(month.income / 1000).toFixed(0)}k</span>
                          </div>
                          <div 
                            className="profile-bar expense"
                            style={{ height: `${(month.expense / maxMonthlyAmount) * 100}%` }}
                            title={`Expense: ₹${month.expense.toFixed(0)}`}
                          >
                            <span className="profile-bar-value">₹{(month.expense / 1000).toFixed(0)}k</span>
                          </div>
                        </div>
                        <div className="profile-month-label">{month.month}</div>
                      </div>
                    ))}
                  </div>
                  <div className="profile-chart-legend-h">
                    <div className="profile-legend-h-item">
                      <div className="profile-legend-color" style={{ backgroundColor: '#22c55e' }} />
                      <span>Income</span>
                    </div>
                    <div className="profile-legend-h-item">
                      <div className="profile-legend-color" style={{ backgroundColor: '#ef4444' }} />
                      <span>Expense</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-empty-state">
                  <span className="profile-empty-icon">📈</span>
                  <p>No transaction data yet</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="profile-section">
              <h2 className="profile-section-title">📊 Quick Stats</h2>
              <div className="profile-analytics-stats">
                <div className="profile-analytics-stat">
                  <div className="profile-analytics-stat-icon">📝</div>
                  <div className="profile-analytics-stat-value">{finances.length}</div>
                  <div className="profile-analytics-stat-label">Transactions</div>
                </div>
                <div className="profile-analytics-stat">
                  <div className="profile-analytics-stat-icon">🎯</div>
                  <div className="profile-analytics-stat-value">{goals.filter(g => !g.completed).length}</div>
                  <div className="profile-analytics-stat-label">Active Goals</div>
                </div>
                <div className="profile-analytics-stat">
                  <div className="profile-analytics-stat-icon">📊</div>
                  <div className="profile-analytics-stat-value">{Object.keys(expensesByCategory).length}</div>
                  <div className="profile-analytics-stat-label">Categories</div>
                </div>
                <div className="profile-analytics-stat">
                  <div className="profile-analytics-stat-icon">💰</div>
                  <div className="profile-analytics-stat-value">₹{(totalIncome / 1000).toFixed(1)}k</div>
                  <div className="profile-analytics-stat-label">Total Income</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
