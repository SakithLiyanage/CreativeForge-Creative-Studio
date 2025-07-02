# CreativeForge - AI Creative Studio

A modern, professional web application for AI-powered image generation, media conversion, and document processing.

## 🚀 Features

### ✨ AI Image Generation
- Multiple AI services (Pollinations, Stable Horde, DALL-E Mini)
- High-quality image generation
- Smart fallback system
- Download and sharing capabilities

### 🎬 Media Conversion
- Image format conversion (JPG, PNG, WebP, etc.)
- Video format conversion
- High-quality processing with FFmpeg
- Batch processing support

### 📄 Document Processing
- PDF Merger - Combine multiple PDFs
- DOCX to PDF conversion
- PDF to DOCX conversion
- PDF splitter (by pages or ranges)
- Text extraction from documents

### 🎨 Modern UI/UX
- Clean, professional design
- Responsive layout
- Smooth animations
- Real-time progress indicators

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Multer** for file uploads
- **Sharp** for image processing
- **FFmpeg** for video processing
- **PDF-lib** for PDF manipulation
- **Mammoth** for DOCX processing

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Icons** for UI icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- FFmpeg (for video processing)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd MediaWeb
```

2. **Install server dependencies**
```bash
npm install
```

3. **Install client dependencies**
```bash
cd client
npm install
cd ..
```

4. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mediaweb

# AI Services (Optional)
HUGGINGFACE_API_KEY=your_huggingface_token_here
OPENAI_API_KEY=your_openai_key_here

# Server Configuration
NODE_ENV=development
PORT=5000
```

5. **Start the application**

Development mode:
```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm run client
```

Production mode:
```bash
npm start
```

## 🎯 Usage

### Image Generation
1. Navigate to AI Studio
2. Enter a descriptive prompt
3. Select AI service (or use Auto)
4. Click "Generate AI Image"
5. Download or view full size

### Media Conversion
1. Go to Media Converter
2. Upload your files
3. Select target format
4. Configure quality settings
5. Process and download

### Document Processing
1. Access Documents section
2. Choose operation (merge, convert, split, extract)
3. Upload files
4. Configure options
5. Process and download results

## 📁 Project Structure

```
MediaWeb/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Main pages
│   │   └── index.js       # App entry point
│   └── package.json
├── routes/                # API routes
│   ├── images.js         # Image generation
│   ├── convert.js        # Media conversion
│   ├── documents.js      # Document processing
│   └── analytics.js      # Analytics
├── models/               # MongoDB models
├── uploads/              # File storage
├── server.js            # Express server
└── package.json
```

## 🔧 Configuration

### MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `.env`

### AI Services Setup
- **Hugging Face**: Free signup at huggingface.co
- **OpenAI**: Paid service for DALL-E

### FFmpeg Installation
- **Windows**: Download from ffmpeg.org
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

## 📊 API Endpoints

### Image Generation
- `POST /api/images/generate` - Generate AI images
- `GET /api/images` - Get recent images

### Media Conversion
- `POST /api/convert/image` - Convert images
- `POST /api/convert/video` - Convert videos

### Document Processing
- `POST /api/documents/merge-pdf` - Merge PDFs
- `POST /api/documents/docx-to-pdf` - Convert DOCX to PDF
- `POST /api/documents/pdf-to-docx` - Convert PDF to DOCX
- `POST /api/documents/split-pdf` - Split PDFs
- `POST /api/documents/extract-text` - Extract text

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

### Environment Variables
Set these in production:
- `NODE_ENV=production`
- `MONGODB_URI=<production-db-url>`
- Add API keys for AI services

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API endpoints

## 🎨 Brand

**CreativeForge** - AI Creative Studio
- Colors: Indigo (#6366f1), Purple (#8b5cf6), Pink (#ec4899)
- Modern, professional, creative design
- Focus on user experience and performance

---

Made with ❤️ by the CreativeForge Team
