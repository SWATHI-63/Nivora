import React, { useState } from 'react';
import { useFinances } from '../../hooks/useLocalStorage';
import './Finance.css';

function Finance() {
  const [finances, setFinances] = useFinances();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };
    setFinances([newTransaction, ...finances]);
    setShowModal(false);
    setFormData({
      type: 'income',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id) => {
    setFinances(finances.filter(f => f.id !== id));
  };

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalExpenses = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  return (
    <div className="finance">
      <div className="finance-header">
        <h1>💰 Finance</h1>
        <button className="add-transaction-btn" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-label">Total Income</div>
          <div className="summary-amount">₹{totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-amount">₹{totalExpenses.toFixed(2)}</div>
        </div>
        <div className="summary-card balance">
          <div className="summary-label">Balance</div>
          <div className="summary-amount">₹{balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {finances.length > 0 ? (
          <div className="transaction-list">
            {finances.map((transaction) => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <div className="transaction-description">
                    {transaction.description || transaction.category}
                  </div>
                  <div className="transaction-meta">
                    {transaction.category} • {transaction.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(transaction.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <p>No transactions yet. Add your first transaction to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                >
                  💰 Income
                </button>
                <button
                  type="button"
                  className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                >
                  💸 Expense
                </button>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;
