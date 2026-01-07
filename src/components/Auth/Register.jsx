import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState('');

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    const result = register(formData.email, formData.password, formData.name);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Account created successfully! Please login.' });
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💎</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your journey with Novira</p>
        </div>

        {message.text && (
          <div className={`auth-${message.type}`}>
            <span>{message.type === 'error' ? '⚠️' : '✓'}</span>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength}`}>
                  <div className="strength-fill"></div>
                </div>
                <span style={{ 
                  color: passwordStrength === 'weak' ? 'var(--danger-color)' : 
                         passwordStrength === 'medium' ? 'var(--warning-color)' : 
                         'var(--success-color)' 
                }}>
                  Password strength: {passwordStrength}
                </span>
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            Create Account
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <div className="auth-switch">
          Already have an account?{' '}
          <span className="auth-switch-link" onClick={onSwitchToLogin}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
