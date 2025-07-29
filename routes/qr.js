const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Create QR codes directory (only in non-serverless environments)
const qrDir = path.join(__dirname, '../uploads/qr-codes');
if (!process.env.VERCEL && !fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
  console.log('📁 Created QR codes directory:', qrDir);
}

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ success: true, message: 'QR route is working!' });
});

// Generate QR Code
router.post('/generate', async (req, res) => {
  try {
    const { 
      content, 
      type = 'text',
      size = 512,
      errorCorrectionLevel = 'M',
      color = '#000000',
      backgroundColor = '#FFFFFF',
      margin = 4,
      format = 'png'
    } = req.body;

    console.log('📱 QR Code generation request:', { type, content: content?.substring(0, 50) });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required for QR code generation' });
    }

    // Process content based on type
    let qrContent = content.trim();
    
    switch (type) {
      case 'url':
        if (!qrContent.startsWith('http://') && !qrContent.startsWith('https://')) {
          qrContent = 'https://' + qrContent;
        }
        break;
      case 'email':
        qrContent = `mailto:${qrContent}`;
        break;
      case 'phone':
        qrContent = `tel:${qrContent}`;
        break;
      case 'sms':
        qrContent = `sms:${qrContent}`;
        break;
      case 'wifi':
        const { ssid, password, security = 'WPA' } = JSON.parse(content);
        qrContent = `WIFI:T:${security};S:${ssid};P:${password};;`;
        break;
      case 'vcard':
        const { name, phone, email, organization } = JSON.parse(content);
        qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${organization}\nEND:VCARD`;
        break;
      case 'location':
        const { latitude, longitude } = JSON.parse(content);
        qrContent = `geo:${latitude},${longitude}`;
        break;
      default:
        // Plain text - use as is
        break;
    }

    // QR Code options
    const options = {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 0.92,
      margin,
      color: {
        dark: color,
        light: backgroundColor
      },
      width: parseInt(size)
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(qrContent, options);
    
    // Handle file saving based on environment
    let filename = null;
    let fileSize = null;
    let downloadUrl = null;
    
    if (!process.env.VERCEL) {
      // Save to file in non-serverless environments
      filename = `qr-${Date.now()}.${format}`;
      const filepath = path.join(qrDir, filename);
      
      // Convert data URL to buffer and save
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);
      
      const stats = fs.statSync(filepath);
      fileSize = stats.size;
      downloadUrl = `/api/qr/download/${filename}`;
    }

    res.json({
      success: true,
      message: 'QR Code generated successfully',
      qrCode: qrCodeDataURL,
      downloadUrl,
      filename,
      fileSize,
      content: qrContent,
      type,
      options: {
        size,
        errorCorrectionLevel,
        color,
        backgroundColor,
        margin
      }
    });

  } catch (error) {
    console.error('❌ QR Code generation error:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      message: error.message
    });
  }
});

// Batch QR Code generation
router.post('/batch', async (req, res) => {
  try {
    const { items, options = {} } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required for batch generation' });
    }

    console.log('📱 Batch QR Code generation:', items.length, 'items');

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i];
        const qrOptions = {
          errorCorrectionLevel: options.errorCorrectionLevel || 'M',
          type: 'image/png',
          quality: 0.92,
          margin: options.margin || 4,
          color: {
            dark: options.color || '#000000',
            light: options.backgroundColor || '#FFFFFF'
          },
          width: parseInt(options.size || 512)
        };

        const qrCodeDataURL = await QRCode.toDataURL(item.content, qrOptions);
        
        // Handle file saving based on environment
        let filename = null;
        let downloadUrl = null;
        
        if (!process.env.VERCEL) {
          filename = `batch-qr-${i + 1}-${Date.now()}.png`;
          const filepath = path.join(qrDir, filename);
          
          const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(filepath, buffer);
          
          downloadUrl = `/api/qr/download/${filename}`;
        }

        results.push({
          index: i,
          content: item.content,
          label: item.label || `QR Code ${i + 1}`,
          qrCode: qrCodeDataURL,
          downloadUrl,
          filename
        });

      } catch (error) {
        errors.push({
          index: i,
          content: items[i].content,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.length} QR codes successfully`,
      results,
      errors,
      total: items.length,
      successful: results.length,
      failed: errors.length
    });

  } catch (error) {
    console.error('❌ Batch QR Code generation error:', error);
    res.status(500).json({
      error: 'Failed to generate batch QR codes',
      message: error.message
    });
  }
});

// Download QR Code
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(qrDir, filename);
    
    console.log('📥 QR Code download request:', filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'QR Code file not found' });
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filepath).size);
    
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ QR Code download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;
