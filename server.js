// CommonJS module - do not use ES module syntax
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist (only in non-serverless environments)
if (!process.env.VERCEL) {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }
}

// Middleware
app.use(cors({
  origin: ['https://creative-forge-creative-studio.vercel.app', 'http://localhost:3000', 'https://creative-forge-creative-studio-front.vercel.app'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded images and documents (only in non-serverless environments)
if (!process.env.VERCEL) {
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
}

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
        serverSelectionTimeoutMS: 5000,
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

// Initialize database connection only if not in serverless environment
if (!process.env.VERCEL) {
  connectDB();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Routes with error handling
const loadRoutes = () => {
  const routeResults = [];
  
  const loadRoute = (name, path) => {
    try {
      console.log(`🔄 Loading ${name} route...`);
      const route = require(path);
      app.use(`/api/${name}`, route);
      console.log(`✅ ${name} route loaded`);
      routeResults.push({ name, success: true });
      return true;
    } catch (error) {
      console.error(`❌ Failed to load ${name} route:`, error.message);
      routeResults.push({ name, success: false, error: error.message });
      return false;
    }
  };

  // Load routes individually to prevent one failure from breaking all
  loadRoute('test-route', './routes/test');
  loadRoute('images', './routes/images');
  loadRoute('videos', './routes/videos');
  loadRoute('convert', './routes/convert');
  loadRoute('analytics', './routes/analytics');
  loadRoute('documents', './routes/documents');
  loadRoute('qr', './routes/qr');
  loadRoute('url', './routes/urlShortener');
  loadRoute('temp-email', './routes/tempEmail');

  const successfulRoutes = routeResults.filter(r => r.success);
  const failedRoutes = routeResults.filter(r => !r.success);

  console.log(`✅ Successfully loaded ${successfulRoutes.length} routes`);
  if (failedRoutes.length > 0) {
    console.log(`❌ Failed to load ${failedRoutes.length} routes:`, failedRoutes.map(r => r.name));
  }

  return successfulRoutes.length > 0; // Return true if at least one route loaded
};

// Load routes
const routesLoaded = loadRoutes();

// Fallback for failed route loading
if (!routesLoaded) {
  console.error('❌ Route loading failed, using fallback');
  app.get('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Some features may be loading. Please try again.',
      path: req.path
    });
  });
} else {
  console.log('✅ All routes loaded successfully');
}

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

// Static file serving for uploaded images and documents (only in non-serverless environments)
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Debug route to check all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  // Get all registered routes
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on app
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        routes.push(`${method.toUpperCase()} ${path}`);
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods);
          methods.forEach(method => {
            routes.push(`${method.toUpperCase()} ${middleware.regexp.source.replace(/\\\//g, '/').replace(/^\/\^/, '').replace(/\/\$/, '')}${path}`);
          });
        }
      });
    }
  });
  
  // Test specific routes
  const testRoutes = [
    '/api/documents',
    '/api/documents/pdf-to-docx',
    '/api/documents/extract-text',
    '/api/convert',
    '/api/convert/image'
  ];
  
  // Check which test routes are actually available
  const availableTestRoutes = testRoutes.filter(testRoute => {
    return routes.some(route => route.includes(testRoute.replace('/api/', '')));
  });
  
  res.json({
    message: 'Available API routes',
    routes: routes,
    routesLoaded: routesLoaded,
    environment: process.env.VERCEL ? 'Vercel' : 'Local',
    testRoutes: testRoutes,
    availableTestRoutes: availableTestRoutes,
    totalRoutes: routes.length,
    status: routes.length > 0 ? 'working' : 'no routes loaded'
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

// Root route handler for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'MediaWeb API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      images: '/api/images',
      convert: '/api/convert',
      documents: '/api/documents',
      qr: '/api/qr',
      url: '/api/url',
      tempEmail: '/api/temp-email'
    }
  });
});

// Serve static files from React build (only in non-serverless environments)
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server (only in non-serverless environments)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n🚀 MediaWeb Server Started Successfully!');
    console.log(`📱 Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Frontend URL: http://localhost:3000`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('─'.repeat(50));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});

// Export for Vercel
module.exports = app;
