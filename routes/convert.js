const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 
      'image/bmp', 'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif',
      'image/avif', 'image/jp2', 'image/jxr'
    ];
    
    const allowedVideoTypes = [
      'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/wmv',
      'video/flv', 'video/webm', 'video/m4v', 'video/3gp', 'video/ogv',
      'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
    ];
    
    const isValidFile = allowedImageTypes.includes(file.mimetype) || 
                       allowedVideoTypes.includes(file.mimetype) ||
                       file.originalname.match(/\.(jpg|jpeg|png|webp|gif|bmp|tiff|svg|heic|heif|avif|jp2|jxr|mp4|avi|mkv|mov|wmv|flv|webm|m4v|3gp|ogv)$/i);
    
    cb(null, isValidFile);
  }
});

// Convert image (PNG to JPG, WebP support, etc.)
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    console.log('🖼️  Image conversion request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFormat = req.body.outputFormat || 'jpeg';
    const quality = parseInt(req.body.quality) || 90;
    const enhance = req.body.enhance === 'true';
    const resize = req.body.resize ? JSON.parse(req.body.resize) : null;
    
    const outputFilename = path.basename(inputPath, path.extname(inputPath)) + 
      (outputFormat === 'jpeg' ? '.jpg' : `.${outputFormat}`);
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    console.log('🔄 Converting image:', {
      input: path.basename(inputPath),
      output: outputFilename,
      format: outputFormat,
      quality,
      enhance,
      resize
    });

    let sharpInstance = sharp(inputPath);

    // Image enhancement
    if (enhance) {
      sharpInstance = sharpInstance
        .normalize() // Auto-adjust levels
        .sharpen() // Sharpen the image
        .modulate({
          brightness: 1.1, // Slightly increase brightness
          saturation: 1.1, // Slightly increase saturation
          hue: 0
        });
    }

    // Resize if specified
    if (resize && resize.width && resize.height) {
      sharpInstance = sharpInstance.resize(parseInt(resize.width), parseInt(resize.height), {
        fit: resize.fit || 'cover',
        position: 'center'
      });
    }

    // Apply conversion based on format
    switch (outputFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality, 
          compressionLevel: 9,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality, 
          effort: 6,
          progressive: true 
        });
        break;
      case 'avif':
        sharpInstance = sharpInstance.avif({ quality, effort: 9 });
        break;
      case 'tiff':
        sharpInstance = sharpInstance.tiff({ quality });
        break;
      case 'heif':
        sharpInstance = sharpInstance.heif({ quality });
        break;
      default:
        throw new Error(`Unsupported format: ${outputFormat}`);
    }

    await sharpInstance.toFile(outputPath);

    // Verify the output file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error('Conversion failed - output file not created');
    }

    // Clean up original file
    fs.unlinkSync(inputPath);
    console.log('✅ Image conversion completed');

    const stats = fs.statSync(outputPath);
    res.json({
      success: true,
      message: 'Image converted successfully',
      downloadUrl: `/uploads/${outputFilename}`,
      filename: outputFilename,
      originalName: req.file.originalname,
      convertedName: outputFilename,
      originalSize: req.file.size,
      convertedSize: stats.size,
      format: outputFormat,
      quality,
      enhanced: enhance
    });
  } catch (error) {
    console.error('❌ Image conversion error:', error);
    
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to convert image',
      message: error.message
    });
  }
});

// Convert video (MKV to MP4, etc.)
router.post('/video', upload.single('file'), async (req, res) => {
  try {
    console.log('🎥 Video conversion request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFormat = req.body.outputFormat || 'mp4';
    const quality = req.body.quality || 'medium';
    const outputFilename = path.basename(inputPath, path.extname(inputPath)) + `.${outputFormat}`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    console.log('🔄 Converting video:', {
      input: path.basename(inputPath),
      output: outputFilename,
      format: outputFormat,
      quality
    });

    // Create a promise-based wrapper for ffmpeg
    const convertVideo = () => {
      return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('📹 FFmpeg started:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('⏳ Processing: ' + Math.round(progress.percent || 0) + '% done');
          })
          .on('end', () => {
            console.log('✅ Video conversion completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('❌ FFmpeg error:', err);
            reject(err);
          });

        // Quality settings
        const qualitySettings = {
          low: { crf: 28, preset: 'fast' },
          medium: { crf: 23, preset: 'medium' },
          high: { crf: 18, preset: 'slow' },
          ultra: { crf: 15, preset: 'veryslow' }
        };

        const settings = qualitySettings[quality] || qualitySettings.medium;

        // Configure based on output format
        switch (outputFormat.toLowerCase()) {
          case 'mp4':
            command.videoCodec('libx264')
                   .audioCodec('aac')
                   .format('mp4')
                   .addOption('-crf', settings.crf)
                   .addOption('-preset', settings.preset);
            break;
          case 'webm':
            command.videoCodec('libvpx-vp9')
                   .audioCodec('libopus')
                   .format('webm')
                   .addOption('-crf', settings.crf)
                   .addOption('-b:v', '0');
            break;
          case 'avi':
            command.videoCodec('libx264')
                   .audioCodec('mp3')
                   .format('avi')
                   .addOption('-crf', settings.crf);
            break;
          case 'mov':
            command.videoCodec('libx264')
                   .audioCodec('aac')
                   .format('mov')
                   .addOption('-crf', settings.crf);
            break;
          case 'wmv':
            command.videoCodec('wmv2')
                   .audioCodec('wmav2')
                   .format('wmv');
            break;
          case 'flv':
            command.videoCodec('flv1')
                   .audioCodec('mp3')
                   .format('flv');
            break;
          case '3gp':
            command.videoCodec('h263')
                   .audioCodec('aac')
                   .format('3gp');
            break;
          default:
            command.videoCodec('libx264')
                   .audioCodec('aac')
                   .format('mp4')
                   .addOption('-crf', settings.crf);
        }

        command.run();
      });
    };

    await convertVideo();

    // Verify the output file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error('Video conversion failed - output file not created');
    }

    // Clean up original file
    fs.unlinkSync(inputPath);

    const stats = fs.statSync(outputPath);
    res.json({
      success: true,
      message: 'Video converted successfully',
      downloadUrl: `/uploads/${outputFilename}`,
      filename: outputFilename,
      originalName: req.file.originalname,
      convertedName: outputFilename,
      originalSize: req.file.size,
      convertedSize: stats.size,
      format: outputFormat,
      quality
    });
  } catch (error) {
    console.error('❌ Video conversion error:', error);
    
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to convert video',
      message: error.message
    });
  }
});

// Download endpoint for converted files
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    console.log('📥 Download request for:', filename);
    console.log('📍 File path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('end', () => {
      console.log('✅ File downloaded successfully:', filename);
    });
    
    fileStream.on('error', (error) => {
      console.error('❌ Download error:', error);
      res.status(500).json({ error: 'Failed to download file' });
    });
    
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Get conversion history
router.get('/history', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsPath).map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        downloadUrl: `/uploads/${filename}`
      };
    });
    
    res.json(files.sort((a, b) => new Date(b.created) - new Date(a.created)));
  } catch (error) {
    console.error('❌ History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversion history' });
  }
});

module.exports = router;
