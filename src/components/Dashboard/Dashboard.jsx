import React, { useState } from 'react';
import { useFinances, useGoals, useTasks, useNotes, useStreaks } from '../../hooks/useLocalStorage';
import './Dashboard.css';

function Dashboard() {
  const [finances] = useFinances();
  const [goals] = useGoals();
  const [tasks] = useTasks();
  const [notes, setNotes] = useNotes();
  const [streaks, setStreaks] = useStreaks();
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [noteColor, setNoteColor] = useState('#22c55e');
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);

  // Update streak on page load
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = streaks.lastActiveDate;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = streaks.currentStreak;
      if (lastActive === yesterdayStr) {
        newStreak = streaks.currentStreak + 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }
      
      setStreaks({
        ...streaks,
        currentStreak: newStreak,
        longestStreak: Math.max(streaks.longestStreak, newStreak),
        lastActiveDate: today,
        totalActiveDays: streaks.totalActiveDays + 1,
        streakHistory: [...streaks.streakHistory, today].slice(-30)
      });
    }
  }, []);

  const noteColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: noteDate,
      color: noteColor,
      createdAt: new Date().toISOString()
    };
    
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...newNote, id: editingNote.id } : n));
    } else {
      setNotes([newNote, ...notes]);
    }
    
    setNoteText('');
    setNoteDate(new Date().toISOString().split('T')[0]);
    setNoteColor('#22c55e');
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteText(note.text);
    setNoteDate(note.date);
    setNoteColor(note.color);
    setShowNoteModal(true);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  // Get notes for display (sorted by date, most recent first)
  const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  // Calculate financial summary
  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalExpenses = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  // Get active goals
  const activeGoals = goals.filter(g => !g.completed).slice(0, 3);

  // Get this week's tasks
  const weekTasks = tasks.slice(0, 5);
  const completedTasks = weekTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back! 👋</h1>
        <p className="dashboard-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Current Balance</div>
              <div className="stat-value">
                ₹{balance.toFixed(2)}
              </div>
            </div>
            <div className="stat-icon">💵</div>
          </div>
          <div className={`stat-trend ${balance >= 0 ? 'trend-positive' : 'trend-negative'}`}>
            {balance >= 0 ? '↗' : '↘'} {balance >= 0 ? 'Positive' : 'Negative'} Balance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Active Goals</div>
              <div className="stat-value">{activeGoals.length}</div>
            </div>
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-trend">
            {goals.filter(g => g.completed).length} completed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Weekly Tasks</div>
              <div className="stat-value">
                {completedTasks}/{weekTasks.length}
              </div>
            </div>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-trend trend-positive">
            {weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0}% Complete
          </div>
        </div>
      </div>

      <div className="quick-view-card">
        <h2 className="section-title">🎯 Top Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="quick-goals-list">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="quick-goal-item">
                <div className="item-info">
                  <div className="item-title">{goal.title}</div>
                  <div className="item-meta">
                    Priority: {goal.priority} • ₹{goal.currentAmount} / ₹{goal.targetAmount}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(goal.currentAmount / goal.targetAmount) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p>No active goals. Start by creating your first goal!</p>
          </div>
        )}
      </div>

      <div className="quick-view-card">
        <h2 className="section-title">✓ Recent Tasks</h2>
        {weekTasks.length > 0 ? (
          <div className="quick-tasks-list">
            {weekTasks.map((task) => (
              <div key={task.id} className="quick-task-item">
                <div className="item-info">
                  <div className="item-title">{task.title}</div>
                  <div className="item-meta">{task.date}</div>
                </div>
                <span className={`task-status ${task.status}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="quick-view-card notes-section">
        <div className="notes-header">
          <h2 className="section-title">📝 Notes</h2>
          <button className="add-note-btn" onClick={() => setShowNoteModal(true)}>
            + Add Note
          </button>
        </div>
        
        {sortedNotes.length > 0 ? (
          <div className="notes-grid">
            {sortedNotes.map((note) => (
              <div 
                key={note.id} 
                className={`note-card ${expandedNote === note.id ? 'expanded' : ''}`}
                onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
              >
                <div className="note-calendar-header" style={{ backgroundColor: note.color }}>
                  <span className="note-month">
                    {new Date(note.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="note-day">
                    {new Date(note.date).getDate()}
                  </span>
                  <span className="note-year">
                    {new Date(note.date).getFullYear()}
                  </span>
                </div>
                <div className="note-body">
                  {expandedNote === note.id ? (
                    <div className="note-expanded-content">
                      <div className="note-text">{note.text}</div>
                      <div className="note-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="note-edit-btn" onClick={() => handleEditNote(note)}>✏️ Edit</button>
                        <button className="note-delete-btn" onClick={() => handleDeleteNote(note.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div className="note-preview">
                      <span className="note-tap-hint">Tap to view</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No notes yet. Add your first note!</p>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="note-modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h3>{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
              <button className="note-modal-close" onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNoteText('');
              }}>×</button>
            </div>
            
            <div className="note-modal-body">
              <div className="note-form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="note-date-input"
                />
              </div>
              
              <div className="note-form-group">
                <label>Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your note here..."
                  className="note-textarea"
                  rows={4}
                />
              </div>
              
              <div className="note-form-group">
                <label>Color</label>
                <div className="note-color-picker">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      className={`note-color-btn ${noteColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNoteColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="note-modal-footer">
              <button className="note-cancel-btn" onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNoteText('');
              }}>Cancel</button>
              <button className="note-save-btn" onClick={handleAddNote}>
                {editingNote ? 'Update' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
