const Goal = require('../models/Goal');

// Get all goals for user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { title, description, targetAmount, currentAmount, deadline, category } = req.body;

    const goal = new Goal({
      userId: req.user._id,
      title,
      description,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category,
    });

    await goal.save();
    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    Object.assign(goal, req.body);
    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
