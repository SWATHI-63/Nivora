const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  category: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp
taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
    this.completed = true;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
