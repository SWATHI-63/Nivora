const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'reminder'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  link: {
    type: String,
    trim: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mark read timestamp
notificationSchema.pre('save', function (next) {
  if (this.read && !this.readAt) {
    this.readAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
