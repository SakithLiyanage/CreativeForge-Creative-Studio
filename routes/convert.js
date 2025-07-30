const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const CloudConvert = require('cloudconvert');

const router = express.Router();

// Create converted files directory (only in non-serverless environments)
const convertedDir = path.join(__dirname, '../uploads/converted');
if (!process.env.VERCEL && !fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
  console.log('📁 Created converted files directory:', convertedDir);
}

// Configure multer for file uploads (with Vercel compatibility)
const storage = process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, convertedDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'input-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer with flexible field handling
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files
  }
});

// Create a more robust upload middleware
const createUploadMiddleware = () => {
  return (req, res, next) => {
    console.log('📤 Upload middleware called');
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    // Create multer instance for this request
    const uploadInstance = multer({
      storage: process.env.VERCEL ? multer.memoryStorage() : storage,
      limits: { 
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 10
      },
      fileFilter: (req, file, cb) => {
        console.log('📁 File received:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype
        });
        cb(null, true); // Accept all files
      }
    });

    // Try multiple field names
    const tryUploads = [
      () => uploadInstance.array('files', 10),
      () => uploadInstance.single('file'),
      () => uploadInstance.any() // Accept any field name
    ];

    let currentTry = 0;

    const attemptUpload = () => {
      if (currentTry >= tryUploads.length) {
        console.error('❌ All upload attempts failed');
        return res.status(400).json({ 
          error: 'File upload failed',
          message: 'No files found in request'
        });
      }

      const uploadFn = tryUploads[currentTry];
      currentTry++;

      uploadFn()(req, res, (err) => {
        if (err) {
          console.log(`❌ Upload attempt ${currentTry} failed:`, err.code);
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            // Try next upload method
            return attemptUpload();
          } else {
            return res.status(400).json({ 
              error: 'File upload failed',
              message: err.message 
            });
          }
        }

        // Success - normalize the files array
        if (req.file && !req.files) {
          req.files = [req.file];
        } else if (!req.files && req.file) {
          req.files = [req.file];
        } else if (!req.files) {
          req.files = [];
        }

        console.log('✅ Upload successful, files:', req.files.length);
        next();
      });
    };

    attemptUpload();
  };
};

// Use the robust upload middleware
const robustUpload = createUploadMiddleware();

// Initialize CloudConvert
const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWMyZWYxOGE1ZmNkMWE3YTQwOTI0Y2FiMTVmOGI4NTI4ODQ0MzM4ZTNhMGYzNTBjNmFhMmMxM2U4ZjQyZDViYTk4OWI2NDIzNzQ5MDllNjciLCJpYXQiOjE3NTE1MzYxNDUuOTUxMjg1LCJuYmYiOjE3NTE1MzYxNDUuOTUxMjg3LCJleHAiOjQ5MDcyMDk3NDUuOTQ2Mjg3LCJzdWIiOiI3MjM1MTYxNCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.ogRr0j9CzyPvdp9qlMafhpw99UHtZV3iDFbodqvGMFBnS3qJWH72cwbAJz9ooFfCJUWTJIsDQBVwhybiMM7WbbglK0w9K5bnPS6mPPMm96QEhf8gXBwRfmM9uNU2CpAvCzjP9ZSUcAOAjO0Mc07slKq7tfRsoFBPbS28zLFgM_oRJQTKXMqqYpr4_9G64JPIouOytHwlSXBFa4A4EzVhuNF2qt6AGE8nb1Iyu1b2ZXSAbYHrVRrC9RgrxIfFOwAwn5mkP8xFPrLujVOyo38JuNymPwOKSzn_3SYBiqtwVkB2NLjIc1PhqS87V1wHWRQPhNfcEjktxovo_sKPknuAVdZNbw4ruApfyG0z6-R4O7qppTxSajaNoUtIkTDUZpL0_1XpB9WZVHALfjJ_GAFL6-j0CaHEVrrMNz9GUgxnY0vzk1tOwRnGurKUVV3mN1AhwSxaRCsOV11p2lYSUFJdHlz4sTMbDD-Q-oVV4u1etQM76q2e-dnarY773HWvvMQOodwyWqd9gFOCYIPqatO88cjg1JjI-OYvgOgc4sSdX_VskHry9m_e8J7OLnW1zbVnCv2mPbSAu2D7_wvNrp58IAQbMNdr7c9I3fFLdpxcNXu85uepDTgjH4Mpge2T7ujT_Rfjiumd_b3Cm8atzZkqASZzeK5jVvUJI8o-I37XHCo');

// Helper function for CloudConvert operations
async function convertWithCloudConvert(inputPath, outputFormat, filename) {
  try {
    console.log(`🌐 Starting CloudConvert job: ${filename} -> ${outputFormat}`);
    
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-file': {
          operation: 'import/upload'
        },
        'convert-file': {
          operation: 'convert',
          input: 'import-file',
          output_format: outputFormat
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-file'
        }
      }
    });

    const uploadTask = job.tasks.filter(task => task.name === 'import-file')[0];
    const inputFile = fs.createReadStream(inputPath);
    
    await cloudConvert.tasks.upload(uploadTask, inputFile, filename);
    console.log('📤 File uploaded to CloudConvert');
    
    const completedJob = await cloudConvert.jobs.wait(job.id);
    console.log('✅ CloudConvert job completed');
    
    const exportTask = completedJob.tasks.filter(
      task => task.operation === 'export/url' && task.status === 'finished'
    )[0];
    
    if (!exportTask || !exportTask.result || !exportTask.result.files[0]) {
      throw new Error('CloudConvert export failed');
    }
    
    const downloadUrl = exportTask.result.files[0].url;
    console.log('🔗 CloudConvert download URL:', downloadUrl);
    
    return downloadUrl;
  } catch (error) {
    console.error('❌ CloudConvert error:', error);
    throw error;
  }
}

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Convert route is working!' });
});

// Image Conversion
router.post('/image', robustUpload, async (req, res) => {
  try {
    console.log('🖼️ Image conversion request received');
    console.log('Files received:', req.files?.length || 0);
    console.log('Request body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded for conversion' });
    }

    const { format = 'png', quality = 90, width, height } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        console.log(`🔄 Converting ${file.originalname} to ${format}`);
        
        const outputFilename = `converted-${Date.now()}-${path.basename(file.originalname, path.extname(file.originalname))}.${format}`;
        const outputPath = path.join(convertedDir, outputFilename);

        let sharpInstance = sharp(file.path);

        // Apply resize if specified
        if (width || height) {
          const resizeOptions = {};
          if (width) resizeOptions.width = parseInt(width);
          if (height) resizeOptions.height = parseInt(height);
          sharpInstance = sharpInstance.resize(resizeOptions);
        }

        // Convert based on format
        switch (format.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            await sharpInstance.jpeg({ quality: parseInt(quality) }).toFile(outputPath);
            break;
          case 'png':
            await sharpInstance.png({ compressionLevel: Math.round((100 - quality) / 10) }).toFile(outputPath);
            break;
          case 'webp':
            await sharpInstance.webp({ quality: parseInt(quality) }).toFile(outputPath);
            break;
          default:
            await sharpInstance.toFormat(format).toFile(outputPath);
        }

        // Get file stats and metadata
        const stats = fs.statSync(outputPath);
        const metadata = await sharp(outputPath).metadata();

        results.push({
          originalName: file.originalname,
          filename: outputFilename,
          downloadUrl: `/api/convert/download/${outputFilename}`,
          fileSize: stats.size,
          format: format.toUpperCase(),
          dimensions: `${metadata.width}x${metadata.height}`,
          success: true
        });

        // Clean up input file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        console.log(`✅ Successfully converted ${file.originalname}`);

      } catch (error) {
        console.error(`❌ Error converting ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    const successful = results.filter(r => r.success);

    res.json({
      success: true,
      message: `Successfully converted ${successful.length} of ${results.length} images`,
      results: successful
    });

  } catch (error) {
    console.error('❌ Image conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to convert images',
      message: error.message
    });
  }
});

// Video Conversion
router.post('/video', robustUpload, async (req, res) => {
  try {
    console.log('🎬 Video conversion request received');
    console.log('📁 Files received:', req.files?.length || 0);
    console.log('📋 Request body keys:', Object.keys(req.body));
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files found in request');
      console.log('📋 Request files:', req.files);
      console.log('📋 Request file:', req.file);
      return res.status(400).json({ 
        error: 'No video files uploaded',
        debug: {
          filesLength: req.files?.length || 0,
          hasFile: !!req.file,
          bodyKeys: Object.keys(req.body)
        }
      });
    }

    const { format = 'mp4', quality = 90 } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        console.log(`🔄 Converting video ${file.originalname} to ${format} using CloudConvert`);
        
        // Test CloudConvert connection first
        try {
          const downloadUrl = await convertWithCloudConvert(
            file.path, 
            format, 
            file.originalname
          );

          results.push({
            originalName: file.originalname,
            filename: `${path.basename(file.originalname, path.extname(file.originalname))}.${format}`,
            downloadUrl: downloadUrl,
            fileSize: file.size,
            format: format.toUpperCase(),
            success: true,
            convertedBy: 'CloudConvert'
          });

          console.log(`✅ Video conversion completed: ${file.originalname}`);

        } catch (cloudError) {
          console.error(`❌ CloudConvert failed for ${file.originalname}:`, cloudError.message);
          
          // Fallback: save original file locally for download
          const fallbackFilename = `original-${Date.now()}-${path.basename(file.originalname)}`;
          const fallbackPath = path.join(convertedDir, fallbackFilename);
          fs.copyFileSync(file.path, fallbackPath);
          
          results.push({
            originalName: file.originalname,
            filename: fallbackFilename,
            downloadUrl: `/api/convert/download/${fallbackFilename}`,
            fileSize: file.size,
            format: `Original (${path.extname(file.originalname).slice(1).toUpperCase()})`,
            success: true,
            note: 'CloudConvert failed - original file available for download',
            convertedBy: 'Local fallback'
          });
        }

      } catch (error) {
        console.error(`❌ Error processing ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });
      }

      // Clean up input file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    const successful = results.filter(r => r.success);

    res.json({
      success: true,
      message: `Processed ${successful.length} of ${results.length} video files`,
      results: successful
    });

  } catch (error) {
    console.error('❌ Video conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to process videos',
      message: error.message
    });
  }
});

// Audio Conversion
router.post('/audio', robustUpload, async (req, res) => {
  try {
    console.log('🎵 Audio conversion request received');
    console.log('📁 Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No audio files uploaded',
        debug: {
          filesLength: req.files?.length || 0,
          hasFile: !!req.file
        }
      });
    }

    const { format = 'mp3', quality = 90 } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        console.log(`🔄 Converting audio ${file.originalname} to ${format} using CloudConvert`);
        
        try {
          const downloadUrl = await convertWithCloudConvert(
            file.path, 
            format, 
            file.originalname
          );

          results.push({
            originalName: file.originalname,
            filename: `${path.basename(file.originalname, path.extname(file.originalname))}.${format}`,
            downloadUrl: downloadUrl,
            fileSize: file.size,
            format: format.toUpperCase(),
            success: true,
            convertedBy: 'CloudConvert'
          });

          console.log(`✅ Audio conversion completed: ${file.originalname}`);

        } catch (cloudError) {
          console.error(`❌ CloudConvert failed for ${file.originalname}:`, cloudError.message);
          
          // Fallback: save original file locally
          const fallbackFilename = `original-${Date.now()}-${path.basename(file.originalname)}`;
          const fallbackPath = path.join(convertedDir, fallbackFilename);
          fs.copyFileSync(file.path, fallbackPath);
          
          results.push({
            originalName: file.originalname,
            filename: fallbackFilename,
            downloadUrl: `/api/convert/download/${fallbackFilename}`,
            fileSize: file.size,
            format: `Original (${path.extname(file.originalname).slice(1).toUpperCase()})`,
            success: true,
            note: 'CloudConvert failed - original file available for download',
            convertedBy: 'Local fallback'
          });
        }

      } catch (error) {
        console.error(`❌ Error processing ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });
      }

      // Clean up input file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    const successful = results.filter(r => r.success);

    res.json({
      success: true,
      message: `Processed ${successful.length} of ${results.length} audio files`,
      results: successful
    });

  } catch (error) {
    console.error('❌ Audio conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to process audio files',
      message: error.message
    });
  }
});

// Download endpoint - Enhanced with better logging
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(convertedDir, filename);
    
    console.log('Download requested for:', filename);
    console.log('Looking for file at:', filepath);
    
    // List directory contents for debugging
    try {
      const files = fs.readdirSync(convertedDir);
      console.log('Directory contents:', files);
    } catch (err) {
      console.log('Cannot read directory:', err);
    }
    
    if (!fs.existsSync(filepath)) {
      console.error('❌ File not found:', filepath);
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file stats
    const stats = fs.statSync(filepath);
    console.log('📊 File stats:', { size: stats.size, modified: stats.mtime });
    
    // Set proper headers for download
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
    }
    
    console.log('📄 Serving file with content type:', contentType);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    
    fileStream.on('open', () => {
      console.log('✅ File stream opened successfully');
    });
    
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File read error' });
      }
    });
    
    fileStream.on('end', () => {
      console.log('✅ File stream completed');
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed', details: error.message });
    }
  }
});

// Test endpoint to check converted files
router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(convertedDir).map(filename => {
      const filepath = path.join(convertedDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        downloadUrl: `/api/convert/download/${filename}`
      };
    });
    
    res.json({
      success: true,
      convertedDir,
      files
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list files',
      convertedDir,
      message: error.message
    });
  }
});

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Convert route is working!',
    endpoints: {
      image: 'POST /api/convert/image',
      video: 'POST /api/convert/video',
      audio: 'POST /api/convert/audio'
    }
  });
});

module.exports = router;

