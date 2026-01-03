import React, { useState, useEffect } from 'react';
import { useTasks, useLocalStorage } from '../../hooks/useLocalStorage';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useTasks();
  const [reflections, setReflections] = useLocalStorage('nivora-reflections', {});
  const [showModal, setShowModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const getWeekKey = (weekOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + (weekOffset * 7));
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  };

  const weekKey = getWeekKey(currentWeek);
  const weekTasks = tasks.filter(task => task.weekKey === weekKey);

  useEffect(() => {
    setReflectionText(reflections[weekKey] || '');
  }, [weekKey, reflections]);

  const getWeekDisplay = () => {
    const date = new Date();
    date.setDate(date.getDate() + (currentWeek * 7));
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    if (currentWeek === 0) {
      return 'This Week';
    }
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      ...formData,
      weekKey: weekKey,
      date: new Date().toISOString(),
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          status: !task.completed ? 'completed' : 'pending'
        };
      }
      return task;
    }));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const saveReflection = () => {
    setReflections({ ...reflections, [weekKey]: reflectionText });
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 2000);
  };

  const completedCount = weekTasks.filter(t => t.completed).length;
  const inProgressCount = weekTasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="tasks">
      <div className="tasks-header">
        <h1>✓ Weekly Tasks</h1>
        <button className="add-task-btn" onClick={() => setShowModal(true)}>
          + New Task
        </button>
      </div>

      <div className="week-selector">
        <button className="week-nav-btn" onClick={() => setCurrentWeek(currentWeek - 1)}>
          ←
        </button>
        <div className="week-display">{getWeekDisplay()}</div>
        <button className="week-nav-btn" onClick={() => setCurrentWeek(currentWeek + 1)}>
          →
        </button>
      </div>

      <div className="week-stats">
        <div className="week-stat">
          <div className="week-stat-value">{weekTasks.length}</div>
          <div className="week-stat-label">Total Tasks</div>
        </div>
        <div className="week-stat">
          <div className="week-stat-value">{completedCount}</div>
          <div className="week-stat-label">Completed</div>
        </div>
        <div className="week-stat">
          <div className="week-stat-value">{inProgressCount}</div>
          <div className="week-stat-label">In Progress</div>
        </div>
      </div>

      {weekTasks.length > 0 ? (
        <div className="tasks-list">
          {weekTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-main">
                <div
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTaskComplete(task.id)}
                />
                <div className="task-content">
                  <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <span className="task-meta-item">
                      📅 {new Date(task.date).toLocaleDateString()}
                    </span>
                    <span className="task-meta-item">
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority} priority
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-footer">
                <span className={`status-badge ${task.status}`}>{task.status}</span>
                <div className="task-actions">
                  {!task.completed && task.status !== 'in-progress' && (
                    <button
                      className="task-action-btn"
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'in-progress' && !task.completed && (
                    <button
                      className="task-action-btn"
                      onClick={() => updateTaskStatus(task.id, 'pending')}
                    >
                      Pause
                    </button>
                  )}
                  <button
                    className="task-action-btn delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No tasks for this week. Start by creating your first task!</p>
        </div>
      )}

      <div className="reflection-section">
        <h2>📝 Week Reflection</h2>
        <textarea
          className="reflection-input"
          placeholder="How was your week? What did you accomplish? What could be improved?"
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          onBlur={saveReflection}
        />
        {reflectionSaved && (
          <div className="reflection-saved">✓ Reflection saved</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete project report"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional task details"
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
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
