import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFinances, useGoals, useTasks } from '../../hooks/useLocalStorage';
import './Profile.css';

function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [tasks] = useTasks();
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

  // Achievement badges
  const achievements = [
    { icon: '🏆', label: 'First Goal', unlocked: goals.length > 0 },
    { icon: '💎', label: 'Saver', unlocked: balance > 1000 },
    { icon: '🎯', label: 'Achiever', unlocked: completedGoals >= 3 },
    { icon: '⚡', label: 'Productive', unlocked: completedTasks >= 10 },
    { icon: '📊', label: 'Tracker', unlocked: finances.length >= 20 },
    { icon: '🌟', label: 'Superstar', unlocked: completedGoals >= 5 && completedTasks >= 20 },
  ];

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
          className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span>⚡</span> Activity
        </button>
        <button 
          className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span>🏆</span> Achievements
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

        {activeTab === 'activity' && (
          <div className="profile-tab-content">
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
              <h2 className="profile-section-title">🏆 Achievements</h2>
              <div className="profile-achievements-grid">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`profile-achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="profile-achievement-icon">{achievement.icon}</div>
                    <div className="profile-achievement-label">{achievement.label}</div>
                    {achievement.unlocked && <div className="profile-achievement-badge">✓</div>}
                  </div>
                ))}
              </div>
            </div>

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
      </div>
    </div>
  );
}

export default Profile;
