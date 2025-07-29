// Video model with fallback
let Video;
try {
  Video = require('../models/Video');
} catch (error) {
  console.log('📝 Video model not found, using memory storage');
  Video = null;
}

// Get all videos with error handling
router.get('/', async (req, res) => {
  try {
    let videos = [];
    
    if (Video && mongoose.connection.readyState === 1) {
      videos = await Video.find().sort({ createdAt: -1 }).limit(20);
    } else {
      videos = videosMemory.slice(-20).reverse();
    }
    
    res.json(videos);
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    res.status(200).json([]); // Return empty array instead of error
  }
});