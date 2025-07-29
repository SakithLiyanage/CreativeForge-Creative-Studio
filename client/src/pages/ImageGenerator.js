import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { 
  IoSparkles, 
  IoImages, 
  IoDownload,
  IoOpenOutline,
  IoStar,
  IoCheckmarkCircle,
  IoAlert,
  IoVideocam,
  IoArrowForward
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const examplePrompts = [
    "A futuristic city at sunset with flying cars",
    "A magical forest with glowing mushrooms",
    "A cute cat wearing a wizard hat",
    "A majestic dragon flying over mountains",
    "A cyberpunk street scene with neon lights"
  ];

  const generateImage = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImage(null);
    setImageLoaded(false);
    
    try {
      console.log('🎨 Sending generation request...');
      const response = await api.post('/api/images/generate', { 
        prompt: prompt.trim()
      });
      
      console.log('✅ Response received:', response.data);
      
      if (response.data.success) {
        setGeneratedImage(response.data);
        setPrompt('');
      } else {
        throw new Error('Generation failed');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Generation timed out. The AI service might be busy. Please try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to generate image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      const urlParts = generatedImage.localPath.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Use fetch to download
      const response = await fetch(`${api.defaults.baseURL}/api/images/download/${filename}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mediaweb-${generatedImage.service}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
      window.open(generatedImage.imageUrl, '_blank');
    }
  };

  const useExamplePrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 content-with-navbar bg-pattern-dots">
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Hero Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-indigo-100 mb-8 shadow-lg">
            <IoStar className="text-yellow-500 animate-bounce-gentle" />
            <span className="text-sm font-semibold gradient-text">AI Powered Creation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">AI Image</span>
            <br />
            <span className="text-gray-900">Generator</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Transform your imagination into stunning visuals with advanced artificial intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Generation Panel */}
          <div className="space-y-8">
            
            {/* Main Form */}
            <div className="card-modern animate-slide-up-fade delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <IoSparkles className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-black gradient-text">Create Magic</h2>
              </div>

              <form onSubmit={generateImage} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Describe Your Vision
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A majestic landscape with mountains, lakes, and golden sunset..."
                    className="input-modern resize-none"
                    rows="4"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{prompt.length}/500</span>
                    <span className="text-sm gradient-text">✨ Be creative and detailed</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Your Masterpiece...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <IoImages className="text-xl" />
                      <span>Generate AI Image</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl animate-slide-up-fade">
                  <div className="flex items-center text-red-700">
                    <IoAlert className="mr-3 text-xl" />
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Info */}
             
            </div>

            {/* Example Prompts */}
            <div className="card-modern animate-slide-up-fade delay-300">
              <h3 className="font-bold gradient-text mb-4 flex items-center">
                <IoStar className="text-yellow-500 mr-2" />
                Inspiration Gallery
              </h3>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-indigo-100"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-8">
            {generatedImage ? (
              <div className="card-modern animate-slide-up-fade delay-450">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <IoCheckmarkCircle className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-black gradient-text">Your Creation</h2>
                </div>

                <div className="relative group">
                  {!imageLoaded && (
                    <div className="absolute inset-0 loading-shimmer rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-semibold">Creating your masterpiece...</p>
                      </div>
                    </div>
                  )}

                  <img
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    className={`w-full rounded-2xl shadow-elegant transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setError('Image failed to load. Please try again.')}
                  />
                </div>

                {/* Image Info */}
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-gray-700 font-medium">
                    <span className="font-bold gradient-text">Prompt:</span> {generatedImage.prompt}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    <span className="font-bold">AI Service:</span> {generatedImage.service}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={downloadImage}
                    className="btn-primary"
                  >
                    <IoDownload className="mr-2" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => window.open(generatedImage.imageUrl, '_blank')}
                    className="btn-secondary"
                  >
                    <IoOpenOutline className="mr-2" />
                    View Full
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-450">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoImages className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Ready to Create?</h3>
                <p className="text-gray-500 text-body">Enter your prompt and watch AI magic happen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
                 