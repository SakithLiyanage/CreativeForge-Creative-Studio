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

// Create documents directory if it doesn't exist
const documentsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
  console.log('📁 Created documents directory:', documentsDir);
}

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    const isValidFile = allowedTypes.includes(file.mimetype) || 
                       file.originalname.match(/\.(pdf|docx|doc|txt)$/i);
    
    cb(null, isValidFile);
  }
});

// PDF Merger
router.post('/merge-pdf', upload.array('files'), async (req, res) => {
  try {
    console.log('📄 PDF merge request received');
    
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    const merger = new PDFMerger();
    
    // Add all PDF files to merger
    for (const file of req.files) {
      if (file.mimetype === 'application/pdf') {
        await merger.add(file.path);
      }
    }

    const outputPath = path.join(path.dirname(req.files[0].path), `merged-${Date.now()}.pdf`);
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
      pagesCount: req.files.length // Approximate
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
router.post('/docx-to-pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('📝 DOCX to PDF conversion request');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from DOCX
    const docxBuffer = fs.readFileSync(req.file.path);
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
    const outputFilename = path.basename(req.file.path, path.extname(req.file.path)) + '.pdf';
    const outputPath = path.join(path.dirname(req.file.path), outputFilename);
    
    fs.writeFileSync(outputPath, pdfBytes);

    // Clean up input file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const stats = fs.statSync(outputPath);

    res.json({
      success: true,
      message: 'DOCX converted to PDF successfully',
      downloadUrl: `/api/documents/download/${outputFilename}`,
      filename: outputFilename,
      originalName: req.file.originalname,
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
router.post('/pdf-to-docx', upload.single('file'), async (req, res) => {
  try {
    console.log('📄 PDF to DOCX conversion request');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    
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
    
    const outputFilename = path.basename(req.file.path, path.extname(req.file.path)) + '.docx';
    const outputPath = path.join(path.dirname(req.file.path), outputFilename);
    
    fs.writeFileSync(outputPath, buffer);

    // Clean up input file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const stats = fs.statSync(outputPath);

    res.json({
      success: true,
      message: 'PDF converted to DOCX successfully',
      downloadUrl: `/api/documents/download/${outputFilename}`,
      filename: outputFilename,
      originalName: req.file.originalname,
      fileSize: stats.size,
      convertedFormat: 'DOCX',
      extractedText: pdfData.text.substring(0, 200) + '...'
    });

  } catch (error) {
    console.error('❌ PDF to DOCX error:', error);
    res.status(500).json({ 
      error: 'Failed to convert PDF to DOCX',
      message: error.message
    });
  }
});

// PDF Splitter
router.post('/split-pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('✂️ PDF split request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { startPage = 1, endPage, splitType = 'pages' } = req.body;
    const inputPath = req.file.path;
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
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    console.log('📖 Text extraction request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    let extractedText = '';
    let wordCount = 0;

    if (req.file.mimetype === 'application/pdf') {
      // Extract from PDF
      const pdfBuffer = fs.readFileSync(inputPath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
      wordCount = pdfData.text.split(/\s+/).filter(word => word.length > 0).length;
    } else if (req.file.mimetype.includes('wordprocessingml')) {
      // Extract from DOCX
      const docxBuffer = fs.readFileSync(inputPath);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      extractedText = result.value;
      wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    }

    // Save extracted text
    const textFilename = `extracted-text-${Date.now()}.txt`;
    const textPath = path.join(path.dirname(inputPath), textFilename);
    fs.writeFileSync(textPath, extractedText);

    // Clean up input file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
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

module.exports = router;
      