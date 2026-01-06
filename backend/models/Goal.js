const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['savings', 'investment', 'debt', 'personal', 'other'],
    default: 'personal',
  },
  targetAmount: {
    type: Number,
    min: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  milestones: [{
    title: String,
    amount: Number,
    date: Date,
    completed: { type: Boolean, default: false },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate progress before saving
goalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  if (this.targetAmount > 0) {
    this.progress = Math.min((this.currentAmount / this.targetAmount) * 100, 100);
  }
  
  if (this.progress >= 100 && this.status === 'active') {
    this.status = 'completed';
  }
  
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
