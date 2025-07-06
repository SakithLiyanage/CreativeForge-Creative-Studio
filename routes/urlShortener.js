const express = require('express');
const validator = require('validator');
const short = require('short-uuid');
const ShortUrl = require('../models/ShortUrl');

const router = express.Router();

// Generate short URL
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    // Validate URL
    if (!originalUrl || !validator.isURL(originalUrl)) {
      return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Check if URL already exists
    let existingUrl = await ShortUrl.findOne({ originalUrl });
    if (existingUrl) {
      return res.json({
        success: true,
        message: 'URL already shortened',
        data: existingUrl
      });
    }

    // Generate or use custom short code
    let shortCode;
    if (customCode) {
      // Validate custom code
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
        return res.status(400).json({ error: 'Custom code can only contain letters, numbers, hyphens, and underscores' });
      }
      
      // Check if custom code is already taken
      const existingCode = await ShortUrl.findOne({ shortCode: customCode });
      if (existingCode) {
        return res.status(400).json({ error: 'Custom code is already taken' });
      }
      shortCode = customCode;
    } else {
      // Generate random short code
      shortCode = short.generate().substring(0, 8);
      
      // Ensure uniqueness
      while (await ShortUrl.findOne({ shortCode })) {
        shortCode = short.generate().substring(0, 8);
      }
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

    // Create new short URL
    const newShortUrl = new ShortUrl({
      originalUrl,
      shortCode,
      shortUrl
    });

    await newShortUrl.save();

    res.json({
      success: true,
      message: 'URL shortened successfully',
      data: newShortUrl
    });

  } catch (error) {
    console.error('❌ URL shortener error:', error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// Get URL analytics
router.get('/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const urlData = await ShortUrl.findOne({ shortCode });
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      success: true,
      data: {
        originalUrl: urlData.originalUrl,
        shortUrl: urlData.shortUrl,
        clicks: urlData.clicks,
        createdAt: urlData.createdAt,
        clickHistory: urlData.clickHistory.slice(-10) // Last 10 clicks
      }
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get user's URLs
router.get('/my-urls', async (req, res) => {
  try {
    const recentUrls = await ShortUrl.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('originalUrl shortUrl shortCode clicks createdAt');

    res.json({
      success: true,
      data: recentUrls
    });

  } catch (error) {
    console.error('❌ Get URLs error:', error);
    res.status(500).json({ error: 'Failed to get URLs' });
  }
});

module.exports = router;
