const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getSummary 
} = require('../controllers/financeController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/finance/transactions
// @desc    Get all transactions for user
// @access  Private
router.get('/transactions', getTransactions);

// @route   POST /api/finance/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/transactions', createTransaction);

// @route   PUT /api/finance/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/transactions/:id', updateTransaction);

// @route   DELETE /api/finance/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/transactions/:id', deleteTransaction);

// @route   GET /api/finance/summary
// @desc    Get financial summary
// @access  Private
router.get('/summary', getSummary);

module.exports = router;
