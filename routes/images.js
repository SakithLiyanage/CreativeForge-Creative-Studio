const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Working AI image generation services
const imageServices = {
  // Service 1: Pollinations AI (Most reliable)
  pollinations: async (prompt) => {
    try {
      console.log('🌸 Trying Pollinations AI...');
      const cleanPrompt = prompt.replace(/[^\w\s]/g, ' ').trim();
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const seed = Math.floor(Math.random() * 1000000);
      
      // Direct image URL from Pollinations
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&private=true`;
      
      console.log('🔗 Generated URL:', imageUrl);
      
      // Download and save the image locally
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const filename = `pollinations_${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, response.data);
      
      console.log('✅ Pollinations image saved locally');
      return `/uploads/${filename}`;
    } catch (error) {
      throw new Error(`Pollinations failed: ${error.message}`);
    }
  },

  // Service 2: Stable Horde (Free distributed AI)
  stablehorde: async (prompt) => {
    try {
      console.log('🤖 Trying Stable Horde...');
      
      // Submit generation request
      const submitResponse = await axios.post('https://stablehorde.net/api/v2/generate/async', {
        prompt: prompt,
        params: {
          sampler_name: "k_euler_a",
          cfg_scale: 7.5,
          denoising_strength: 0.75,
          seed: Math.floor(Math.random() * 1000000),
          height: 1024,
          width: 1024,
          steps: 20
        },
        nsfw: false,
        trusted_workers: true,
        r2: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0000000000'
        }
      });
      
      const jobId = submitResponse.data.id;
      console.log('🔄 Stable Horde job submitted:', jobId);
      
      // Poll for completion
      let attempts = 0;
      while (attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const statusResponse = await axios.get(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
        
        if (statusResponse.data.done) {
          const imageUrl = statusResponse.data.generations[0].img;
          
          // Download and save
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const filename = `stablehorde_${Date.now()}.png`;
          const filepath = path.join(uploadsDir, filename);
          fs.writeFileSync(filepath, imageResponse.data);
          
          console.log('✅ Stable Horde image saved');
          return `/uploads/${filename}`;
        }
        attempts++;
      }
      throw new Error('Stable Horde timeout');
    } catch (error) {
      throw new Error(`Stable Horde failed: ${error.message}`);
    }
  },

  // Service 3: DALL-E Mini (Free alternative)
  dallemini: async (prompt) => {
    try {
      console.log('🎨 Trying DALL-E Mini...');
      
      const response = await axios.post('https://bf.dallemini.ai/generate', {
        prompt: prompt
      }, {
        timeout: 45000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.images && response.data.images.length > 0) {
        const base64Image = response.data.images[0];
        const imageBuffer = Buffer.from(base64Image, 'base64');
        
        const filename = `dallemini_${Date.now()}.png`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, imageBuffer);
        
        console.log('✅ DALL-E Mini image saved');
        return `/uploads/${filename}`;
      }
      throw new Error('No images returned');
    } catch (error) {
      throw new Error(`DALL-E Mini failed: ${error.message}`);
    }
  },

  // Service 4: Local placeholder generator (Always works)
  placeholder: async (prompt) => {
    try {
      console.log('🎭 Creating local placeholder...');
      const hash = prompt.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffff, 0);
      const color = hash.toString(16).padStart(6, '0');
      
      const response = await axios.get(`https://via.placeholder.com/1024x1024/${color}/ffffff?text=${encodeURIComponent(prompt.substring(0, 30))}`, {
        responseType: 'arraybuffer'
      });
      
      const filename = `placeholder_${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, response.data);
      
      console.log('✅ Placeholder saved');
      return `/uploads/${filename}`;
    } catch (error) {
      throw new Error(`Placeholder failed: ${error.message}`);
    }
  }
};

// Main generation function
const generateImage = async (prompt) => {
  const servicesToTry = ['pollinations', 'stablehorde', 'dallemini', 'placeholder'];
  
  for (const serviceName of servicesToTry) {
    try {
      console.log(`🔄 Attempting ${serviceName}...`);
      const imageUrl = await imageServices[serviceName](prompt);
      return { imageUrl, service: serviceName };
    } catch (error) {
      console.log(`⚠️ ${serviceName} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All image generation services failed');
};

// Generate endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('🎨 Starting image generation for:', prompt);
    
    const result = await generateImage(prompt.trim());
    
    res.json({
      success: true,
      imageUrl: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${result.imageUrl}`,
      localPath: result.imageUrl,
      prompt: prompt.trim(),
      service: result.service,
      id: Date.now().toString(),
      message: `Image generated successfully using ${result.service}!`
    });
    
  } catch (error) {
    console.error('❌ Generation completely failed:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
});

// Download endpoint
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    console.log('📥 Download request for:', filename);
    
    if (!fs.existsSync(filepath)) {
      console.log('❌ File not found:', filepath);
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(filepath);
    
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// List generated images
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.match(/\.(png|jpg|jpeg)$/))
      .map(file => ({
        filename: file,
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/uploads/${file}`,
        created: fs.statSync(path.join(uploadsDir, file)).birthtime
      }))
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 20);
    
    res.json(files);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;
