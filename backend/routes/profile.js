const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', updateProfile);

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
router.put('/password', changePassword);

module.exports = router;
