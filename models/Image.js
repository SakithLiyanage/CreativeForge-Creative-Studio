const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    maxLength: 1000
  },
  imageUrl: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    default: 'huggingface',
    enum: ['openai', 'huggingface', 'pollinations', 'aiimage', 'replicate', 'svg']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better query performance
imageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);
