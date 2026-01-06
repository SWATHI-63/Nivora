const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', getTasks);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

module.exports = router;
