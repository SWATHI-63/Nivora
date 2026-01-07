import React, { useState, useEffect } from 'react';
import './PWAInstall.css';

const PWAInstall = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Don't show if already installed
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for install prompt event
    const handleInstallPrompt = () => {
      setShowInstallPrompt(true);
    };

    window.addEventListener('pwa-installable', handleInstallPrompt);

    // Auto-show after 30 seconds if on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (window.installPWA) {
      const accepted = await window.installPWA();
      if (accepted) {
        setShowInstallPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <h4>Install Novira App</h4>
          <p>
            {isIOS 
              ? 'Tap the share button and select "Add to Home Screen"' 
              : 'Install our app for a better experience with offline access'}
          </p>
        </div>
        <div className="pwa-install-actions">
          {!isIOS && (
            <button onClick={handleInstall} className="pwa-install-btn">
              Install
            </button>
          )}
          <button onClick={handleDismiss} className="pwa-dismiss-btn">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
