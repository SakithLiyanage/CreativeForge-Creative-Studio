const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    referrer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
