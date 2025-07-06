const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/ai/' });

// HuggingFace API base
const HF_API = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = process.env.HF_TOKEN || '';
const hfHeaders = HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {};

const imageToBase64 = (filePath) => {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString('base64');
};

// 1. AI Summarization (text)
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'Text too short to summarize.' });
    }
    const response = await axios.post(
      `${HF_API}/facebook/bart-large-cnn`,
      { inputs: text },
      { headers: { ...hfHeaders } }
    );
    const summary = response.data[0]?.summary_text || '';
    res.json({ success: true, summary });
  } catch (error) {
    console.error('AI Summarization error:', error.message);
    res.status(500).json({ error: 'Failed to summarize text.' });
  }
});

// 3. Auto-Tagging for Images (using HuggingFace Space)
router.post('/tag-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
    const base64Image = imageToBase64(req.file.path);
    // Use the HuggingFace Space API
    const response = await axios.post(
      'https://hf.space/embed/nlpconnect/vit-gpt2-image-captioning/api/predict/',
      { data: [base64Image] },
      { headers: { 'Content-Type': 'application/json' } }
    );
    fs.unlinkSync(req.file.path);
    // The model returns a caption, use it as tags
    const caption = response.data?.data?.[0] || '';
    const tags = caption ? caption.split(' ') : [];
    res.json({ success: true, tags });
  } catch (error) {
    console.error('AI Image Tagging error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to tag image.' });
  }
});

// 4. Auto-Tagging for Documents (text)
router.post('/tag-document', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Text too short to tag.' });
    }
    // Define a set of candidate tags (customize as needed)
    const candidateLabels = [
      'finance', 'legal', 'medical', 'technology', 'education', 'sports', 'news', 'science', 'entertainment', 'business', 'personal', 'government', 'health', 'travel', 'food', 'art', 'history', 'nature', 'politics', 'other'
    ];
    const response = await axios.post(
      `${HF_API}/facebook/bart-large-mnli`,
      {
        inputs: text,
        parameters: { candidate_labels: candidateLabels.join(',') }
      },
      { headers: { ...hfHeaders } }
    );
    // The model returns scores for each label
    const tags = response.data?.labels || [];
    res.json({ success: true, tags });
  } catch (error) {
    console.error('AI Document Tagging error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to tag document.' });
  }
});

// 5. Simple Chatbot (no AI)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.length < 1) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    // Simple rule-based or random responses
    const responses = [
      "Hello! How can I help you today?",
      "That's interesting! Tell me more.",
      "I'm here to assist you with anything you need.",
      "Could you please clarify your question?",
      "Thank you for reaching out!",
      "I'm just a simple chatbot, but I'm happy to chat!",
      "Let me know if you need help with the app features.",
      "Sorry, I don't have an answer for that, but I'm learning!"
    ];
    // Simple keyword-based logic
    let reply = responses[Math.floor(Math.random() * responses.length)];
    const msg = message.toLowerCase();

    if (msg.includes("hello") || msg.includes("hi")) {
      reply = "Hi there! 👋";
    } else if (msg.includes("help")) {
      reply = "Sure! You can ask me about any feature in this app, like image generation, document processing, QR codes, or temp email.";
    } else if (msg.includes("thank")) {
      reply = "You're welcome!";
    } else if (msg.includes("image")) {
      reply = "You can generate AI images from text prompts or auto-tag your images in the Gallery!";
    } else if (msg.includes("document") || msg.includes("pdf") || msg.includes("docx")) {
      reply = "Try the Document Processor for merging, splitting, converting, extracting, summarizing, or auto-tagging documents.";
    } else if (msg.includes("qr")) {
      reply = "The QR Code Generator lets you create QR codes for URLs, text, WiFi, and more!";
    } else if (msg.includes("email")) {
      reply = "You can generate a real temporary email address using the Temp Email feature (powered by 1secmail).";
    } else if (msg.includes("shorten") || msg.includes("url")) {
      reply = "Use the URL Shortener to create and manage short links with analytics.";
    } else if (msg.includes("dashboard") || msg.includes("stats")) {
      reply = "The Dashboard shows real-time stats for all features: images, documents, QR codes, short URLs, and temp emails.";
    } else if (msg.includes("who are you") || msg.includes("your name")) {
      reply = "I'm your friendly CreativeForge Studio chatbot! Here to help you explore all the app's features.";
    } else if (msg.includes("bye") || msg.includes("goodbye")) {
      reply = "Goodbye! Have a creative day! 👋";
    }
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chatbot response.' });
  }
});

module.exports = router; 