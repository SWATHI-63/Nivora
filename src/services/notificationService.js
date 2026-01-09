// Notification Service for Nivora
// Handles push notifications, reminders, and alerts

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  // Check notification permission
  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Request notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }
    return 'denied';
  }

  // Send browser notification
  async sendNotification(title, options = {}) {
    await this.checkPermission();
    
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/nivora-logo.png',
        badge: '/nivora-logo.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    }
  }

  // Check for due bills
  checkDueBills(transactions) {
    const today = new Date();
    const upcomingDays = 3;
    const alerts = [];

    transactions.forEach(transaction => {
      if (transaction.recurring?.isRecurring && transaction.recurring?.nextDate) {
        const dueDate = new Date(transaction.recurring.nextDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilDue >= 0 && daysUntilDue <= upcomingDays) {
          alerts.push({
            type: 'bill',
            title: 'Bill Due Soon',
            message: `${transaction.description || transaction.category} is due in ${daysUntilDue} day(s)`,
            amount: transaction.amount,
            daysUntilDue
          });
        }
      }
    });

    return alerts;
  }

  // Check low balance
  checkLowBalance(balance, threshold = 1000) {
    if (balance < threshold) {
      return {
        type: 'low-balance',
        title: 'Low Balance Alert',
        message: `Your balance is ₹${balance.toFixed(2)}. Consider reviewing your expenses.`,
        balance
      };
    }
    return null;
  }

  // Check goal milestones
  checkGoalMilestones(goals) {
    const celebrations = [];

    goals.forEach(goal => {
      const progress = goal.targetAmount > 0 
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0;

      // Check if milestone reached
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (progress >= milestone && !goal[`celebrated_${milestone}`]) {
          celebrations.push({
            type: 'goal-milestone',
            title: `🎉 Goal Milestone: ${milestone}%`,
            message: `You've reached ${milestone}% of "${goal.title}"!`,
            goalId: goal.id,
            milestone,
            progress
          });
        }
      });

      // Check if goal completed
      if (goal.status === 'completed' && !goal.celebrated_completion) {
        celebrations.push({
          type: 'goal-completed',
          title: '🏆 Goal Completed!',
          message: `Congratulations! You've completed "${goal.title}"!`,
          goalId: goal.id
        });
      }
    });

    return celebrations;
  }

  // Analyze spending patterns
  analyzeSpendingPatterns(transactions) {
    const alerts = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get current month expenses
    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Get last month expenses
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Alert if spending increased by >20%
    if (lastMonthExpenses > 0) {
      const increase = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
      if (increase > 20) {
        alerts.push({
          type: 'spending-increase',
          title: '⚠️ Spending Alert',
          message: `Your spending is up ${increase.toFixed(0)}% compared to last month`,
          increase
        });
      }
    }

    // Category-wise unusual spending
    const categoryExpenses = {};
    transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    // Check top spending categories
    const topCategory = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory && topCategory[1] > currentMonthExpenses * 0.4) {
      alerts.push({
        type: 'category-alert',
        title: 'High Category Spending',
        message: `${topCategory[0]} accounts for ${((topCategory[1] / currentMonthExpenses) * 100).toFixed(0)}% of your spending`,
        category: topCategory[0],
        amount: topCategory[1]
      });
    }

    return alerts;
  }

  // Check overdue tasks
  checkOverdueTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdue = tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });

    if (overdue.length > 0) {
      return {
        type: 'overdue-tasks',
        title: 'Overdue Tasks',
        message: `You have ${overdue.length} overdue task(s)`,
        count: overdue.length,
        tasks: overdue
      };
    }
    return null;
  }

  // Generate weekly summary
  generateWeeklySummary(transactions, goals, tasks) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weekIncome = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const weekExpenses = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedTasks = tasks.filter(t => 
      t.status === 'completed' && 
      new Date(t.completedAt) >= weekAgo
    ).length;

    const activeGoals = goals.filter(g => g.status === 'active').length;

    return {
      type: 'weekly-summary',
      title: '📊 Your Weekly Summary',
      message: `Income: ₹${weekIncome.toFixed(0)} | Expenses: ₹${weekExpenses.toFixed(0)} | Tasks: ${completedTasks} completed`,
      data: {
        income: weekIncome,
        expenses: weekExpenses,
        netSavings: weekIncome - weekExpenses,
        tasksCompleted: completedTasks,
        activeGoals
      }
    };
  }

  // Generate monthly summary
  generateMonthlySummary(transactions, goals, tasks) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedTasks = tasks.filter(t => {
      if (t.status !== 'completed') return false;
      const date = new Date(t.completedAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const completedGoals = goals.filter(g => g.status === 'completed').length;

    return {
      type: 'monthly-summary',
      title: '📈 Your Monthly Summary',
      message: `Total Income: ₹${monthIncome.toFixed(0)} | Total Expenses: ₹${monthExpenses.toFixed(0)}`,
      data: {
        income: monthIncome,
        expenses: monthExpenses,
        netSavings: monthIncome - monthExpenses,
        savingsRate: monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome * 100).toFixed(1) : 0,
        tasksCompleted: completedTasks,
        goalsCompleted: completedGoals
      }
    };
  }

  // Schedule daily check
  scheduleDailyChecks(callback) {
    // Run checks immediately
    callback();

    // Then run every hour
    const interval = setInterval(callback, 60 * 60 * 1000);
    return interval;
  }
}

export default new NotificationService();
