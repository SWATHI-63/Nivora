import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--accent-color)';
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1 className="notifications-title">🔔 Notifications</h1>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn-clear" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔕</div>
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div 
                className="notification-priority-indicator"
                style={{ backgroundColor: getPriorityColor(notification.priority) }}
              />
              
              <div className="notification-icon">
                {notification.icon}
              </div>
              
              <div className="notification-content">
                <div className="notification-header-row">
                  <h3 className="notification-title-text">{notification.title}</h3>
                  <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                
                {notification.type && (
                  <span className={`notification-badge ${notification.type}`}>
                    {notification.type}
                  </span>
                )}
              </div>
              
              <button 
                className="notification-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
