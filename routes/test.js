const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  });
});

// POST test endpoint
router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test POST endpoint is working!',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 