# CreativeForge Platform

A full-featured, modern web app for creative media processing, powered by free AI APIs.

## 🚀 Features

- **AI Image Generation**: Create stunning images from text prompts using DALL-E, Stable Diffusion, and more.
- **Document Processor**:
  - PDF merge, split, convert (PDF <-> DOCX), and text extraction
  - **AI Summarization**: Summarize long documents or extracted text using HuggingFace models
  - **AI Auto-Tagging**: Generate tags for documents using AI zero-shot classification
- **AI Image Auto-Tagging**: Generate descriptive tags for images using HuggingFace Spaces (image captioning)
- **QR Code Generator**: Create QR codes for URLs, text, WiFi, and more
- **URL Shortener**: Create and manage short links with analytics
- **Temporary Email**: Generate real, disposable email addresses using the 1secmail API
- **Chatbot**: Interactive chatbot available on all pages with helpful responses and creative assistance
- **Real-Time Dashboard**: View live stats for all features (images, documents, QR codes, short URLs, temp emails, etc.)
- **Modern UI**: Responsive, mobile-friendly, and beautiful design

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI/ML APIs**: HuggingFace Inference API, 1secmail

## 🆓 Free API Usage
- **HuggingFace**: Used for text summarization, document tagging
- **1secmail**: Used for real temporary email addresses

## ⚡ Setup Instructions

### 1. Clone the repo
```sh
git clone <your-repo-url>
cd MediaWeb
```

### 2. Install dependencies
```sh
npm install
cd client && npm install
cd ..
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```
HF_TOKEN=your_huggingface_token_here
```
- Get a free HuggingFace token at https://huggingface.co/settings/tokens (choose "Read" access)

### 4. Start the backend
```sh
npm start
```

### 5. Start the frontend
```sh
cd client
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 📝 Usage Notes
- **AI features** require a valid HuggingFace token in `.env`.
- **Image auto-tagging** uses a public HuggingFace Space; if the Space is down, this feature may be temporarily unavailable.
- **Image enhancement** is not available due to lack of free public upscaler APIs.
- **AI Chatbot** is available on all pages - positioned on the left for Dashboard, right for other pages.

## 📦 Folder Structure
- `client/` — React frontend
- `routes/` — Express API routes (images, documents, ai, qr, temp-email, etc.)
- `models/` — Mongoose models
- `uploads/` — Uploaded/generated files

## ✨ Credits
- [HuggingFace](https://huggingface.co/) for free AI models and Spaces
- [1secmail](https://www.1secmail.com/) for temp email API
- [pdf-lib](https://pdf-lib.js.org/), [mammoth.js](https://github.com/mwilliamson/mammoth.js), and other open-source tools

---

**Enjoy your all-in-one AI-powered creative platform!**
