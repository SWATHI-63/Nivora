import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFinances, useGoals, useTasks } from '../hooks/useLocalStorage';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [tasks] = useTasks();

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nivora-notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('nivora-notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Check for budget alerts
  useEffect(() => {
    const budgets = JSON.parse(localStorage.getItem('nivora-budgets') || '{}');
    const categoryExpenses = {};

    finances
      .filter(f => f.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categoryExpenses[category] = (categoryExpenses[category] || 0) + transaction.amount;
      });

    Object.entries(categoryExpenses).forEach(([category, spent]) => {
      const budget = budgets[category];
      if (budget) {
        const percentage = (spent / budget) * 100;
        
        // Check if we already sent this notification recently
        const recentAlert = notifications.find(n => 
          n.type === 'budget' && 
          n.category === category &&
          new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within 24 hours
        );

        if (!recentAlert) {
          if (percentage >= 100) {
            addNotification({
              type: 'budget',
              category,
              title: `${category} Budget Exceeded!`,
              message: `You've spent ₹${spent.toFixed(0)} of your ₹${budget.toFixed(0)} budget (${percentage.toFixed(0)}%)`,
              priority: 'high',
              icon: '🚨'
            });
          } else if (percentage >= 90) {
            addNotification({
              type: 'budget',
              category,
              title: `${category} Budget Alert`,
              message: `You've used ${percentage.toFixed(0)}% of your ${category} budget`,
              priority: 'medium',
              icon: '⚠️'
            });
          }
        }
      }
    });
  }, [finances]);

  // Check for goal deadlines
  useEffect(() => {
    const now = new Date();
    
    goals
      .filter(g => !g.completed && g.deadline)
      .forEach(goal => {
        const deadline = new Date(goal.deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        // Check if we already sent this notification recently
        const recentAlert = notifications.find(n => 
          n.type === 'goal' && 
          n.goalId === goal.id &&
          new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!recentAlert) {
          if (daysLeft === 0) {
            addNotification({
              type: 'goal',
              goalId: goal.id,
              title: `Goal Deadline Today!`,
              message: `"${goal.name}" is due today. Current progress: ${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`,
              priority: 'high',
              icon: '🎯'
            });
          } else if (daysLeft > 0 && daysLeft <= 7) {
            addNotification({
              type: 'goal',
              goalId: goal.id,
              title: `Goal Deadline Approaching`,
              message: `"${goal.name}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
              priority: 'medium',
              icon: '⏰'
            });
          }
        }
      });
  }, [goals]);

  // Check for task due dates
  useEffect(() => {
    const now = new Date();
    
    tasks
      .filter(t => !t.completed && t.dueDate)
      .forEach(task => {
        const dueDate = new Date(task.dueDate);
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Check if we already sent this notification recently
        const recentAlert = notifications.find(n => 
          n.type === 'task' && 
          n.taskId === task.id &&
          new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!recentAlert) {
          if (daysLeft === 0) {
            addNotification({
              type: 'task',
              taskId: task.id,
              title: `Task Due Today!`,
              message: `"${task.title}" is due today`,
              priority: 'high',
              icon: '📌'
            });
          } else if (daysLeft > 0 && daysLeft <= 3) {
            addNotification({
              type: 'task',
              taskId: task.id,
              title: `Task Due Soon`,
              message: `"${task.title}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
              priority: 'medium',
              icon: '⏰'
            });
          }
        }
      });
  }, [tasks]);

  // Check for achievements
  useEffect(() => {
    const totalIncome = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
    const balance = totalIncome - totalExpenses;
    const completedGoals = goals.filter(g => g.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;

    const achievements = [
      { id: 'first-goal', condition: goals.length > 0, message: 'Created your first goal!' },
      { id: 'saver', condition: balance > 10000, message: 'Saved over ₹10,000!' },
      { id: 'achiever', condition: completedGoals >= 3, message: 'Completed 3 goals!' },
      { id: 'productive', condition: completedTasks >= 10, message: 'Completed 10 tasks!' },
      { id: 'tracker', condition: finances.length >= 20, message: 'Tracked 20 transactions!' },
      { id: 'superstar', condition: completedGoals >= 5 && completedTasks >= 20, message: 'Became a Superstar!' }
    ];

    achievements.forEach(achievement => {
      if (achievement.condition) {
        // Check if we already sent this achievement
        const alreadySent = notifications.find(n => 
          n.type === 'achievement' && 
          n.achievementId === achievement.id
        );

        if (!alreadySent) {
          addNotification({
            type: 'achievement',
            achievementId: achievement.id,
            title: '🏆 Achievement Unlocked!',
            message: achievement.message,
            priority: 'low',
            icon: '🎉'
          });
        }
      }
    });
  }, [finances, goals, tasks]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
