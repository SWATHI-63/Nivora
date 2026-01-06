const Transaction = require('../models/Transaction');

// Get all transactions for user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      category,
      description,
      date: date || new Date(),
    });

    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    res.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get financial summary
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpense += transaction.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json({ success: true, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getSummary };
