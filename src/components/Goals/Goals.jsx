import React, { useState } from 'react';
import { useGoals } from '../../hooks/useLocalStorage';
import './Goals.css';

function Goals() {
  const [goals, setGoals] = useGoals();
  const [showModal, setShowModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    priority: 'medium',
    deadline: ''
  });
  const [updateAmount, setUpdateAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setGoals([newGoal, ...goals]);
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      priority: 'medium',
      deadline: ''
    });
  };

  const handleUpdate = (goalId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = goal.currentAmount + parseFloat(updateAmount);
        return {
          ...goal,
          currentAmount: newAmount,
          completed: newAmount >= goal.targetAmount
        };
      }
      return goal;
    }));
    setUpdateModal(null);
    setUpdateAmount('');
  };

  const handleComplete = (goalId) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: true } : goal
    ));
  };

  const handleDelete = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return !goal.completed;
    if (filter === 'completed') return goal.completed;
    return true;
  });

  return (
    <div className="goals">
      <div className="goals-header">
        <h1>🎯 Goals</h1>
        <button className="add-goal-btn" onClick={() => setShowModal(true)}>
          + New Goal
        </button>
      </div>

      <div className="goals-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Goals
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {filteredGoals.length > 0 ? (
        <div className="goals-grid">
          {filteredGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className={`goal-card ${goal.completed ? 'completed' : ''}`}>
                <div className="goal-header">
                  <div>
                    <h3 className="goal-title">{goal.title}</h3>
                    <span className={`goal-priority ${goal.priority}`}>
                      {goal.priority}
                    </span>
                  </div>
                  {goal.completed && <span style={{ fontSize: '2rem' }}>✓</span>}
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

                <div className="goal-progress">
                  <div className="progress-info">
                    <span className="progress-text">
                      ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                    </span>
                    <span className="progress-percentage">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {goal.deadline && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}

                <div className="goal-actions">
                  {!goal.completed && (
                    <>
                      <button
                        className="action-btn"
                        onClick={() => setUpdateModal(goal)}
                      >
                        Update Progress
                      </button>
                      <button
                        className="action-btn complete"
                        onClick={() => handleComplete(goal.id)}
                      >
                        Mark Complete
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p>
            {filter === 'completed' 
              ? 'No completed goals yet. Keep working on your active goals!'
              : 'No goals yet. Create your first goal to get started!'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Goal</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Buy a new car"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details about your goal"
                />
              </div>

              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Current Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Progress</h3>
              <button className="close-btn" onClick={() => setUpdateModal(null)}>
                ✕
              </button>
            </div>

            <div className="current-amount">
              <span>Current: ₹{updateModal.currentAmount.toFixed(2)}</span>
            </div>

            <div className="form-group">
              <label>Add Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setUpdateModal(null)}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => handleUpdate(updateModal.id)}
                disabled={!updateAmount || parseFloat(updateAmount) <= 0}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
