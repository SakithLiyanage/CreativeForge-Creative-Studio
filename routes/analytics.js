const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics route is working!',
    models: {
      Image: !!Image,
      ShortUrl: !!ShortUrl,
      TempEmail: !!TempEmail
    }
  });
});

// Try to load models with fallback
let Image, ShortUrl, TempEmail;
try {
  Image = require('../models/Image');
} catch (error) {
  console.log('📝 Image model not found');
  Image = null;
}

try {
  ShortUrl = require('../models/ShortUrl');
} catch (error) {
  console.log('📝 ShortUrl model not found');
  ShortUrl = null;
}

try {
  TempEmail = require('../models/TempEmail');
} catch (error) {
  console.log('📝 TempEmail model not found');
  TempEmail = null;
}

// Get real analytics data
router.get('/stats', async (req, res) => {
  try {
    // Get image generation stats
    let totalImages = 0, imagesThisMonth = 0, imagesThisWeek = 0;
    
    if (Image) {
      try {
        totalImages = await Image.countDocuments();
        imagesThisMonth = await Image.countDocuments({
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        });
        imagesThisWeek = await Image.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
      } catch (error) {
        console.log('📝 Image stats not available:', error.message);
      }
    }

    // Get conversion stats from uploads directory
    const uploadsPath = path.join(__dirname, '../uploads');
    let totalConversions = 0;
    let conversionsThisMonth = 0;
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      totalConversions = files.length;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      files.forEach(file => {
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        if (stats.birthtime >= thisMonth) {
          conversionsThisMonth++;
        }
      });
    }

    // Calculate storage usage
    let storageUsed = 0;
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      files.forEach(file => {
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        storageUsed += stats.size;
      });
    }

    // Count processed documents
    const documentsPath = path.join(__dirname, '../uploads/documents');
    let totalDocuments = 0;
    if (fs.existsSync(documentsPath)) {
      const docFiles = fs.readdirSync(documentsPath);
      totalDocuments = docFiles.length;
    }

    // Count generated QR codes
    const qrCodesPath = path.join(__dirname, '../uploads/qr-codes');
    let totalQRCodes = 0;
    if (fs.existsSync(qrCodesPath)) {
      const qrFiles = fs.readdirSync(qrCodesPath);
      totalQRCodes = qrFiles.length;
    }

    // Count short URLs
    let totalShortUrls = 0;
    if (ShortUrl) {
      try {
        totalShortUrls = await ShortUrl.countDocuments();
      } catch (error) {
        console.log('📝 ShortUrl stats not available:', error.message);
      }
    }

    // Count temp emails
    let totalTempEmails = 0;
    if (TempEmail) {
      try {
        totalTempEmails = await TempEmail.countDocuments();
      } catch (error) {
        console.log('📝 TempEmail stats not available:', error.message);
      }
    }

    // Get recent activity
    let recentImages = [];
    if (Image) {
      try {
        recentImages = await Image.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('prompt createdAt');
      } catch (error) {
        console.log('📝 Recent images not available:', error.message);
      }
    }

    res.json({
      success: true,
      stats: {
        totalImages,
        imagesThisMonth,
        imagesThisWeek,
        totalConversions,
        conversionsThisMonth,
        storageUsed: Math.round(storageUsed / (1024 * 1024)), // MB
        totalProjects: totalImages + totalConversions,
        totalDocuments,
        totalQRCodes,
        totalShortUrls,
        totalTempEmails
      },
      recentActivity: recentImages
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get usage over time
router.get('/usage', async (req, res) => {
  try {
    if (!Image) {
      return res.json({
        success: true,
        dailyStats: []
      });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyStats = await Image.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      dailyStats
    });
  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

module.exports = router;
