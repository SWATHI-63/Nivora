const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/goals
// @desc    Get all goals for user
// @access  Private
router.get('/', getGoals);

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', createGoal);

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put('/:id', updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', deleteGoal);

module.exports = router;
