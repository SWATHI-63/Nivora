import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Finance from './components/Finance/Finance';
import Goals from './components/Goals/Goals';
import Tasks from './components/Tasks/Tasks';
import Profile from './components/Profile/Profile';
import Analytics from './components/Analytics/Analytics';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  // Show auth screens if user is not logged in
  if (!currentUser) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'finance':
        return <Finance />;
      case 'goals':
        return <Goals />;
      case 'tasks':
        return <Tasks />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="app-logo">
            <img src="/nivora-logo.svg" alt="Nivora Logo" style={{ height: '40px' }} />
          </div>
          <div className="header-actions">
            <div className="user-greeting">
              <div className="user-avatar-small">
                {currentUser.photo ? (
                  <img src={currentUser.photo} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="user-name">
                Hi, {currentUser.name}!
              </span>
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {renderView()}
      </main>

      <nav className="bottom-nav">
        <div className="nav-items">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="icon">🏠</span>
            <span>Home</span>
          </button>
          <button
            className={`nav-item ${currentView === 'finance' ? 'active' : ''}`}
            onClick={() => setCurrentView('finance')}
          >
            <span className="icon">💰</span>
            <span>Finance</span>
          </button>
          <button
            className={`nav-item ${currentView === 'goals' ? 'active' : ''}`}
            onClick={() => setCurrentView('goals')}
          >
            <span className="icon">🎯</span>
            <span>Goals</span>
          </button>
          <button
            className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentView('tasks')}
          >
            <span className="icon">✓</span>
            <span>Tasks</span>
          </button>
          <button
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            <span className="icon">📊</span>
            <span>Analytics</span>
          </button>
          <button
            className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            <span className="icon">👤</span>
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
