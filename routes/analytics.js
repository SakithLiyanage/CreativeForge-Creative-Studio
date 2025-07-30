const express = require('express');
const Image = require('../models/Image');
const ShortUrl = require('../models/ShortUrl');
const TempEmail = require('../models/TempEmail');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get real analytics data
router.get('/stats', async (req, res) => {
  try {
    // Get image generation stats
    const totalImages = await Image.countDocuments();
    const imagesThisMonth = await Image.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const imagesThisWeek = await Image.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

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
    const totalShortUrls = await ShortUrl.countDocuments();

    // Count temp emails
    const totalTempEmails = await TempEmail.countDocuments();

    // Get recent activity
    const recentImages = await Image.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('prompt createdAt');

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
