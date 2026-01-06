import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import './Settings.css';

function Settings() {
  const { theme, themes, changeTheme, customColors, updateCustomColor, resetCustomTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const colorKeys = [
    { key: '--accent-color', label: 'Accent Color', icon: '🎨' },
    { key: '--bg-primary', label: 'Background Primary', icon: '🖼️' },
    { key: '--bg-secondary', label: 'Background Secondary', icon: '📄' },
    { key: '--text-primary', label: 'Text Primary', icon: '📝' },
    { key: '--success-color', label: 'Success Color', icon: '✅' },
    { key: '--warning-color', label: 'Warning Color', icon: '⚠️' },
    { key: '--danger-color', label: 'Danger Color', icon: '🚫' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget': return '💰';
      case 'goal': return '🎯';
      case 'task': return '✅';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  const displayedNotifications = showAllNotifications 
    ? notifications 
    : notifications.slice(0, 5);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">⚙️ Settings</h1>
        <p className="settings-subtitle">Customize your Nivora experience</p>
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <div className="section-header-with-action">
          <div>
            <h2 className="section-title">🔔 Notifications</h2>
            <p className="section-description">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="notification-actions">
              <button className="btn-mark-read" onClick={markAllAsRead}>
                Mark All Read
              </button>
              <button className="btn-clear-all" onClick={clearAll}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon">🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {displayedNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="notification-actions-item">
                    {!notification.read && (
                      <button 
                        className="btn-read"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {notifications.length > 5 && (
              <button 
                className="btn-show-more"
                onClick={() => setShowAllNotifications(!showAllNotifications)}
              >
                {showAllNotifications ? 'Show Less' : `Show All (${notifications.length})`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Theme Selection */}
      <div className="settings-section">
        <h2 className="section-title">🎨 Theme Selection</h2>
        <p className="section-description">Choose your preferred color scheme</p>
        
        <div className="themes-grid">
          {Object.values(themes).filter(t => t.id !== 'custom').map(themeOption => (
            <button
              key={themeOption.id}
              className={`theme-card ${theme === themeOption.id ? 'active' : ''}`}
              onClick={() => changeTheme(themeOption.id)}
            >
              <div className="theme-icon">{themeOption.icon}</div>
              <div className="theme-name">{themeOption.name}</div>
              {theme === themeOption.id && (
                <div className="theme-check">✓</div>
              )}
              <div className="theme-preview">
                {Object.entries(themeOption.colors).slice(0, 5).map(([key, color]) => (
                  <div
                    key={key}
                    className="theme-preview-color"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Theme Builder */}
      <div className="settings-section">
        <div className="section-header-with-action">
          <div>
            <h2 className="section-title">🎨 Custom Theme Builder</h2>
            <p className="section-description">Create your own unique theme</p>
          </div>
          <div className="custom-theme-actions">
            <button 
              className="btn-custom-theme"
              onClick={() => changeTheme('custom')}
            >
              {theme === 'custom' ? '✓ Active' : 'Activate Custom'}
            </button>
            <button 
              className="btn-reset-custom"
              onClick={resetCustomTheme}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="custom-colors-grid">
          {colorKeys.map(({ key, label, icon }) => (
            <div key={key} className="custom-color-item">
              <div className="custom-color-info">
                <span className="color-icon">{icon}</span>
                <div>
                  <div className="color-label">{label}</div>
                  <div className="color-value">{customColors[key] || '#000000'}</div>
                </div>
              </div>
              <div className="custom-color-picker-wrapper">
                <input
                  type="color"
                  value={customColors[key] || '#000000'}
                  onChange={(e) => updateCustomColor(key, e.target.value)}
                  className="color-picker-input"
                />
                <div 
                  className="color-preview"
                  style={{ backgroundColor: customColors[key] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Theme Toggle Info */}
      <div className="settings-section">
        <h2 className="section-title">💡 Quick Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🌙</div>
            <div className="tip-content">
              <h3>Quick Toggle</h3>
              <p>Click the theme button in the header to quickly cycle through themes</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎨</div>
            <div className="tip-content">
              <h3>Custom Colors</h3>
              <p>Create a personalized theme by adjusting individual colors</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💾</div>
            <div className="tip-content">
              <h3>Auto-Save</h3>
              <p>Your theme preference is automatically saved to your browser</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="settings-section">
        <h2 className="section-title">ℹ️ About Nivora</h2>
        <div className="about-card">
          <div className="about-content">
            <h3>Nivora v1.0.0</h3>
            <p>Your personal finance and productivity companion</p>
            <div className="about-features">
              <span className="feature-badge">💰 Finance Tracking</span>
              <span className="feature-badge">🎯 Goal Setting</span>
              <span className="feature-badge">✅ Task Management</span>
              <span className="feature-badge">📊 Analytics</span>
              <span className="feature-badge">🔔 Notifications</span>
              <span className="feature-badge">🎨 Custom Themes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
