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

module.exports = router; 