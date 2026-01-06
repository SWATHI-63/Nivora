import { useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export const useFinances = () => {
  return useLocalStorage('nivora-finances', []);
};

export const useGoals = () => {
  return useLocalStorage('nivora-goals', []);
};

export const useTasks = () => {
  return useLocalStorage('nivora-tasks', []);
};

export const useNotes = () => {
  return useLocalStorage('nivora-notes', []);
};

export const useStreaks = () => {
  return useLocalStorage('nivora-streaks', {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalActiveDays: 0,
    streakHistory: []
  });
};
