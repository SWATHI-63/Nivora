import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const result = login(formData.email, formData.password);
    
    if (!result.success) {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💎</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to Nivora</p>
        </div>

        {message.text && (
          <div className={`auth-${message.type}`}>
            <span>{message.type === 'error' ? '⚠️' : '✓'}</span>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="auth-form-group">
            <label>Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button type="submit" className="auth-submit-btn">
            Sign In
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <div className="auth-switch">
          Don't have an account?{' '}
          <span className="auth-switch-link" onClick={onSwitchToRegister}>
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
