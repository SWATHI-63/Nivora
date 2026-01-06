import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const themes = {
  light: {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    colors: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8faf8',
      '--bg-card': '#ffffff',
      '--text-primary': '#1a2e1a',
      '--text-secondary': '#4a5f4a',
      '--border-color': '#d4e5d4',
      '--accent-color': '#22c55e',
      '--accent-hover': '#16a34a',
      '--success-color': '#10b981',
      '--warning-color': '#f59e0b',
      '--danger-color': '#ef4444',
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    colors: {
      '--bg-primary': '#0f1a0f',
      '--bg-secondary': '#1a2e1a',
      '--bg-card': '#1f3d1f',
      '--text-primary': '#e8f5e8',
      '--text-secondary': '#a8c4a8',
      '--border-color': '#2d4a2d',
      '--accent-color': '#4ade80',
      '--accent-hover': '#22c55e',
      '--success-color': '#34d399',
      '--warning-color': '#fbbf24',
      '--danger-color': '#f87171',
    }
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    icon: '🎨',
    colors: {} // Will be populated from localStorage
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('nivora-theme');
    // Only allow light, dark, or custom
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'custom') {
      return savedTheme;
    }
    return 'light';
  });

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('nivora-custom-theme');
    return saved ? JSON.parse(saved) : themes.light.colors;
  });

  useEffect(() => {
    // Apply theme colors
    const themeColors = theme === 'custom' ? customColors : themes[theme]?.colors || themes.light.colors;
    
    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Set data-theme attribute for legacy CSS
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    
    localStorage.setItem('nivora-theme', theme);
  }, [theme, customColors]);

  const changeTheme = (themeName) => {
    setTheme(themeName);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const updateCustomColor = (colorKey, colorValue) => {
    const newColors = { ...customColors, [colorKey]: colorValue };
    setCustomColors(newColors);
    localStorage.setItem('nivora-custom-theme', JSON.stringify(newColors));
  };

  const resetCustomTheme = () => {
    setCustomColors(themes.light.colors);
    localStorage.removeItem('nivora-custom-theme');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themes,
      changeTheme,
      toggleTheme,
      customColors,
      updateCustomColor,
      resetCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
