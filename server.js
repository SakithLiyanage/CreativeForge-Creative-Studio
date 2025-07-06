const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded images and documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add specific static serving for converted files
app.use('/uploads/converted', express.static(path.join(__dirname, 'uploads/converted')));

// Static file serving for documents with proper headers
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.pdf':
        res.setHeader('Content-Type', 'application/pdf');
        break;
      case '.docx':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        break;
      case '.txt':
        res.setHeader('Content-Type', 'text/plain');
        break;
    }
  }
}));

// Test endpoint with better diagnostics
app.get('/api/test', (req, res) => {
  const apiKeyPresent = !!process.env.OPENAI_API_KEY;
  const apiKeyValid = process.env.OPENAI_API_KEY?.startsWith('sk-');
  
  res.json({ 
    message: 'Backend server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    openai: {
      apiKeyPresent,
      apiKeyValid,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) + '...'
    },
    mongodb: {
      configured: !!process.env.MONGODB_URI,
      connected: mongoose.connection.readyState === 1
    }
  });
});

// MongoDB connection with better error handling and fallback
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB connected successfully');
      return true;
    } else {
      console.warn('⚠️  MONGODB_URI not configured');
      return false;
    }
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed:', err.message);
    console.log('📝 App will continue without database features');
    return false;
  }
};

// Initialize database connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/images', require('./routes/images'));
app.use('/api/convert', require('./routes/convert'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/url', require('./routes/urlShortener'));
app.use('/api/temp-email', require('./routes/tempEmail'));

// URL redirect for shortened URLs
app.get('/s/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const ShortUrl = require('./models/ShortUrl');
    
    const urlData = await ShortUrl.findOne({ shortCode });
    if (!urlData) {
      return res.status(404).send('Short URL not found');
    }

    // Track click
    urlData.clicks += 1;
    urlData.clickHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer')
    });
    
    await urlData.save();

    // Redirect to original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error('❌ Redirect error:', error);
    res.status(500).send('Server error');
  }
});

// Static file serving for uploaded images and documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug route to check all registered routes
app.get('/api/routes', (req, res) => {
  res.json({
    message: 'Available API routes',
    routes: [
      'GET /api/health',
      'GET /api/test', 
      'GET /api/images',
      'POST /api/images/generate',
      'DELETE /api/images/:id',
      'POST /api/convert/image',
      'POST /api/convert/video',
      'GET /api/convert/download/:filename',
      'GET /api/convert/history'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MediaWeb API Server', 
      frontend: 'http://localhost:3000',
      api: `http://localhost:${PORT}/api`
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 MediaWeb Server Started Successfully!');
  console.log(`📱 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:3000`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('─'.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});
