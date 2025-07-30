const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const PDFMerger = require('pdf-merger-js');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const router = express.Router();

// Create documents directory if it doesn't exist (only in non-serverless environments)
const documentsDir = path.join(__dirname, '../uploads/documents');
if (!process.env.VERCEL && !fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
  console.log('📁 Created documents directory:', documentsDir);
}

// Configure multer for document uploads (with Vercel compatibility)
const storage = process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// --- Robust Upload Middleware (copied from convert.js, but with documentsDir) ---
const createUploadMiddleware = () => {
  return (req, res, next) => {
    console.log('📤 Document upload middleware called');
    console.log('📋 Content-Type:', req.headers['content-type']);
    // Create multer instance for this request
    const uploadInstance = multer({
      storage: process.env.VERCEL ? multer.memoryStorage() : storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10
      },
      fileFilter: (req, file, cb) => {
        console.log('📁 Document file received:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype
        });
        cb(null, true); // Accept all files
      }
    });
    const tryUploads = [
      () => uploadInstance.array('files', 10),
      () => uploadInstance.single('file'),
      () => uploadInstance.any()
    ];
    let currentTry = 0;
    const attemptUpload = () => {
      if (currentTry >= tryUploads.length) {
        console.error('❌ All document upload attempts failed');
        return res.status(400).json({
          error: 'File upload failed',
          message: 'No files found in request'
        });
      }
      const uploadFn = tryUploads[currentTry];
      currentTry++;
      uploadFn()(req, res, (err) => {
        if (err) {
          console.log(`❌ Document upload attempt ${currentTry} failed:`, err.code);
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
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
        console.log('✅ Document upload successful, files:', req.files.length);
        next();
      });
    };
    attemptUpload();
  };
};
const robustDocumentUpload = createUploadMiddleware();

// PDF Merger
router.post('/merge-pdf', robustDocumentUpload, async (req, res) => {
  try {
    console.log('📄 PDF merge request received');
    console.log('Files received:', req.files?.length || 0);
    console.log('Request body:', req.body);
    console.log('All files:', req.files?.map(f => ({ name: f.originalname, type: f.mimetype })));
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (req.files.length < 2) {
      return res.status(400).json({ error: `Only ${req.files.length} file(s) uploaded. At least 2 PDF files are required for merging.` });
    }

    // Filter only PDF files
    const pdfFiles = req.files.filter(file => file.mimetype === 'application/pdf');
    
    if (pdfFiles.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required for merging' });
    }

    const merger = new PDFMerger();
    
    // Add all PDF files to merger
    for (const file of pdfFiles) {
      await merger.add(file.path);
    }

    const outputPath = path.join(path.dirname(pdfFiles[0].path), `merged-${Date.now()}.pdf`);
    await merger.save(outputPath);

    // Clean up input files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    const stats = fs.statSync(outputPath);
    const outputFilename = path.basename(outputPath);

    res.json({
      success: true,
      message: 'PDFs merged successfully',
      downloadUrl: `/api/documents/download/${outputFilename}`,
      filename: outputFilename,
      fileSize: stats.size,
      pagesCount: pdfFiles.length
    });

  } catch (error) {
    console.error('❌ PDF merge error:', error);
    res.status(500).json({ 
      error: 'Failed to merge PDFs',
      message: error.message
    });
  }
});

// DOCX to PDF Converter
router.post('/docx-to-pdf', robustDocumentUpload, async (req, res) => {
  try {
    console.log('📝 DOCX to PDF conversion request');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files[0];
    // Extract text from DOCX
    const docxBuffer = fs.readFileSync(file.path);
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    const text = result.value;

    // Create PDF from extracted text
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();
    
    // Text layout settings
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.4;
    const maxWidth = width - 2 * margin;
    const maxY = height - margin;
    
    // Split text into lines that fit the page width
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * fontSize * 0.6 < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Add text to PDF with page breaks
    let y = maxY;
    let pageIndex = 0;
    
    for (const line of lines) {
      if (y < margin + lineHeight) {
        // Add new page if needed
        currentPage = pdfDoc.addPage();
        y = maxY;
        pageIndex++;
      }
      
      currentPage.drawText(line, {
        x: margin,
        y: y,
        size: fontSize,
      });
      y -= lineHeight;
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputFilename = path.basename(file.path, path.extname(file.path)) + '.pdf';
    const outputPath = path.join(path.dirname(file.path), outputFilename);
    
    fs.writeFileSync(outputPath, pdfBytes);

    // Clean up input file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const stats = fs.statSync(outputPath);

    res.json({
      success: true,
      message: 'DOCX converted to PDF successfully',
      downloadUrl: `/api/documents/download/${outputFilename}`,
      filename: outputFilename,
      originalName: file.originalname,
      fileSize: stats.size,
      convertedFormat: 'PDF'
    });

  } catch (error) {
    console.error('❌ DOCX to PDF error:', error);
    res.status(500).json({ 
      error: 'Failed to convert DOCX to PDF',
      message: error.message
    });
  }
});

// PDF to DOCX Converter
router.post('/pdf-to-docx', robustDocumentUpload, async (req, res) => {
  try {
    console.log('📄 PDF to DOCX conversion request');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files[0];
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    // Try enhanced PDF parsing with better error handling
    try {
      const pdfBuffer = fs.readFileSync(file.path);
      
      // Use pdf-parse with more lenient options
      const pdfData = await pdfParse(pdfBuffer, {
        // More lenient parsing options
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });

      // Create DOCX document
      const paragraphs = pdfData.text.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => 
          new Paragraph({
            children: [
              new TextRun({
                text: line.trim(),
                size: 24, // 12pt font
              }),
            ],
          })
        );

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      });

      // Generate DOCX buffer
      const buffer = await Packer.toBuffer(doc);
      
      const outputFilename = path.basename(file.path, path.extname(file.path)) + '.docx';
      const outputPath = path.join(path.dirname(file.path), outputFilename);
      
      fs.writeFileSync(outputPath, buffer);

      // Clean up input file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const stats = fs.statSync(outputPath);

      res.json({
        success: true,
        message: 'PDF converted to DOCX successfully',
        downloadUrl: `/api/documents/download/${outputFilename}`,
        filename: outputFilename,
        originalName: file.originalname,
        fileSize: stats.size,
        convertedFormat: 'DOCX',
        extractedText: pdfData.text.substring(0, 200) + '...'
      });

    } catch (pdfError) {
      console.error('❌ PDF parsing failed, trying CloudConvert fallback:', pdfError.message);
      
      // Fallback to CloudConvert for problematic PDFs
      try {
        const CloudConvert = require('cloudconvert');
        const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWMyZWYxOGE1ZmNkMWE3YTQwOTI0Y2FiMTVmOGI4NTI4ODQ0MzM4ZTNhMGYzNTBjNmFhMmMxM2U4ZjQyZDViYTk4OWI2NDIzNzQ5MDllNjciLCJpYXQiOjE3NTE1MzYxNDUuOTUxMjg1LCJuYmYiOjE3NTE1MzYxNDUuOTUxMjg3LCJleHAiOjQ5MDcyMDk3NDUuOTQ2Mjg3LCJzdWIiOiI3MjM1MTYxNCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.ogRr0j9CzyPvdp9qlMafhpw99UHtZV3iDFbodqvGMFBnS3qJWH72cwbAJz9ooFfCJUWTJIsDQBVwhybiMM7WbbglK0w9K5bnPS6mPPMm96QEhf8gXBwRfmM9uNU2CpAvCzjP9ZSUcAOAjO0Mc07slKq7tfRsoFBPbS28zLFgM_oRJQTKXMqqYpr4_9G64JPIouOytHwlSXBFa4A4EzVhuNF2qt6AGE8nb1Iyu1b2ZXSAbYHrVRrC9RgrxIfFOwAwn5mkP8xFPrLujVOyo38JuNymPwOKSzn_3SYBiqtwVkB2NLjIc1PhqS87V1wHWRQPhNfcEjktxovo_sKPknuAVdZNbw4ruApfyG0z6-R4O7qppTxSajaNoUtIkTDUZpL0_1XpB9WZVHALfjJ_GAFL6-j0CaHEVrrMNz9GUgxnY0vzk1tOwRnGurKUVV3mN1AhwSxaRCsOV11p2lYSUFJdHlz4sTMbDD-Q-oVV4u1etQM76q2e-dnarY773HWvvMQOodwyWqd9gFOCYIPqatO88cjg1JjI-OYvgOgc4sSdX_VskHry9m_e8J7OLnW1zbVnCv2mPbSAu2D7_wvNrp58IAQbMNdr7c9I3fFLdpxcNXu85uepDTgjH4Mpge2T7ujT_Rfjiumd_b3Cm8atzZkqASZzeK5jVvUJI8o-I37XHCo');

        const job = await cloudConvert.jobs.create({
          tasks: {
            'import-file': {
              operation: 'import/upload'
            },
            'convert-file': {
              operation: 'convert',
              input: 'import-file',
              output_format: 'docx'
            },
            'export-file': {
              operation: 'export/url',
              input: 'convert-file'
            }
          }
        });

        const uploadTask = job.tasks.filter(task => task.name === 'import-file')[0];
        const inputFile = fs.createReadStream(file.path);
        
        await cloudConvert.tasks.upload(uploadTask, inputFile, file.originalname);
        const completedJob = await cloudConvert.jobs.wait(job.id);
        
        const exportTask = completedJob.tasks.filter(
          task => task.operation === 'export/url' && task.status === 'finished'
        )[0];
        
        const downloadUrl = exportTask.result.files[0].url;

        // Clean up input file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        res.json({
          success: true,
          message: 'PDF converted to DOCX using CloudConvert',
          downloadUrl: downloadUrl,
          filename: `${path.basename(file.originalname, path.extname(file.originalname))}.docx`,
          originalName: file.originalname,
          convertedFormat: 'DOCX (CloudConvert)',
          note: 'Converted using CloudConvert due to PDF parsing issues'
        });

      } catch (cloudError) {
        console.error('❌ CloudConvert fallback also failed:', cloudError.message);
        
        // Final fallback: return error with helpful message
        res.status(500).json({
          success: false,
          error: 'PDF conversion failed',
          message: 'This PDF file has compression issues that prevent local parsing. Please try a different PDF file.',
          details: {
            localError: pdfError.message,
            cloudError: cloudError.message
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ PDF to DOCX error:', error);
    res.status(500).json({ 
      error: 'Failed to convert PDF to DOCX',
      message: error.message
    });
  }
});

// PDF Splitter
router.post('/split-pdf', robustDocumentUpload, async (req, res) => {
  try {
    console.log('✂️ PDF split request received');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files[0];
    const { startPage = 1, endPage, splitType = 'pages' } = req.body;
    const inputPath = file.path;
    const pdfBuffer = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const totalPages = pdfDoc.getPageCount();
    const outputFiles = [];

    if (splitType === 'pages') {
      // Split into individual pages
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        
        const outputFilename = `page-${i + 1}-${Date.now()}.pdf`;
        const outputPath = path.join(path.dirname(inputPath), outputFilename);
        const pdfBytes = await newPdf.save();
        
        fs.writeFileSync(outputPath, pdfBytes);
        outputFiles.push({
          filename: outputFilename,
          downloadUrl: `/api/documents/download/${outputFilename}`,
          pageNumber: i + 1
        });
      }
    } else {
      // Split by range
      const start = parseInt(startPage) - 1;
      const end = endPage ? parseInt(endPage) - 1 : totalPages - 1;
      
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, Array.from({length: end - start + 1}, (_, i) => start + i));
      pages.forEach(page => newPdf.addPage(page));
      
      const outputFilename = `split-${start + 1}-${end + 1}-${Date.now()}.pdf`;
      const outputPath = path.join(path.dirname(inputPath), outputFilename);
      const pdfBytes = await newPdf.save();
      
      fs.writeFileSync(outputPath, pdfBytes);
      outputFiles.push({
        filename: outputFilename,
        downloadUrl: `/api/documents/download/${outputFilename}`,
        pageRange: `${start + 1}-${end + 1}`
      });
    }

    // Clean up input file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    res.json({
      success: true,
      message: `PDF split successfully into ${outputFiles.length} file(s)`,
      files: outputFiles,
      totalPages: totalPages,
      splitType: splitType
    });

  } catch (error) {
    console.error('❌ PDF split error:', error);
    res.status(500).json({ 
      error: 'Failed to split PDF',
      message: error.message
    });
  }
});

// Document Text Extractor
router.post('/extract-text', robustDocumentUpload, async (req, res) => {
  try {
    console.log('📖 Text extraction request received');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files[0];
    let extractedText = '';
    let wordCount = 0;

    if (file.mimetype === 'application/pdf') {
      try {
        // Try local PDF parsing first
        const pdfBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(pdfBuffer, {
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });
        extractedText = pdfData.text;
        wordCount = pdfData.text.split(/\s+/).filter(word => word.length > 0).length;
      } catch (pdfError) {
        console.error('❌ Local PDF parsing failed:', pdfError.message);
        
        // Return error for problematic PDFs
        return res.status(400).json({
          success: false,
          error: 'PDF text extraction failed',
          message: 'This PDF file has compression or structural issues that prevent text extraction. Please try a different PDF file.',
          details: pdfError.message
        });
      }
    } else if (file.mimetype.includes('wordprocessingml')) {
      // Extract from DOCX
      const docxBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      extractedText = result.value;
      wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    }

    // Save extracted text
    const textFilename = `extracted-text-${Date.now()}.txt`;
    const textPath = path.join(path.dirname(file.path), textFilename);
    fs.writeFileSync(textPath, extractedText);

    // Clean up input file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({
      success: true,
      message: 'Text extracted successfully',
      extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''),
      fullText: extractedText,
      wordCount: wordCount,
      characterCount: extractedText.length,
      downloadUrl: `/api/documents/download/${textFilename}`,
      filename: textFilename
    });

  } catch (error) {
    console.error('❌ Text extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract text',
      message: error.message
    });
  }
});

// Download endpoint
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads/documents', filename);
    
    console.log('📥 Document download request:', filename);
    console.log('📁 Looking for file at:', filepath);
    
    if (!fs.existsSync(filepath)) {
      console.error('❌ File not found:', filepath);
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set proper headers for download
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filepath).size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      res.status(500).json({ error: 'File read error' });
    });
    
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Documents route is working!',
    endpoints: {
      'merge-pdf': 'POST /api/documents/merge-pdf',
      'docx-to-pdf': 'POST /api/documents/docx-to-pdf',
      'pdf-to-docx': 'POST /api/documents/pdf-to-docx',
      'split': 'POST /api/documents/split',
      'extract': 'POST /api/documents/extract'
    }
  });
});

// Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Documents test endpoint working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;