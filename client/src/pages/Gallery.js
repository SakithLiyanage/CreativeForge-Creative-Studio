import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get('/api/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'recent') return new Date(image.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return true;
  });

  const handleTagImage = async () => {
    if (!selectedImage) return;
    setAiLoading(true);
    setAiError('');
    setTags([]);
    try {
      const blob = await fetch(selectedImage.imageUrl).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      const response = await api.post('/api/ai/tag-image', formData);
      setTags(response.data.tags);
    } catch (err) {
      setAiError('Failed to tag image.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold gradient-text mb-4">AI Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the creative possibilities of AI-generated art
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 rounded-2xl border border-white/20">
            {[
              { key: 'all', label: 'All Images', icon: '🎨' },
              { key: 'recent', label: 'Recent', icon: '⏰' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl skeleton"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image._id}
                className="group cursor-pointer animate-fadeInUp hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedImage(image)}
              >
                <div className="glass-card p-4 rounded-2xl border border-white/20">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full aspect-square object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <p className="text-sm text-gray-600 line-clamp-2 font-medium">
                    {image.prompt}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeInUp">
            <div className="max-w-4xl w-full glass-dark rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Generated Image</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="w-full max-h-96 object-contain rounded-xl mb-4"
              />
              <p className="text-white mb-2">
                <strong>Prompt:</strong> {selectedImage.prompt}
              </p>
              <p className="text-gray-300 text-sm">
                Created: {new Date(selectedImage.createdAt).toLocaleString()}
              </p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => window.open(selectedImage.imageUrl, '_blank')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-6 py-2 glass-card text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={handleTagImage}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  disabled={aiLoading}
                >
                  Auto-Tag
                </button>
              </div>
              {aiError && <div className="mt-4 text-red-400">{aiError}</div>}
              {tags.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <h5 className="font-bold text-green-700 mb-1">AI Tags:</h5>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
