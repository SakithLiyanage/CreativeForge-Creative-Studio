const mongoose = require('mongoose');

const tempEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  messages: [{
    from: String,
    subject: String,
    body: String,
    html: String,
    receivedAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
});

// Auto-delete expired emails
tempEmailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TempEmail', tempEmailSchema);
