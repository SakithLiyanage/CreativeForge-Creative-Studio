import React, { useState } from 'react';
import axios from 'axios';
import { 
  HiCheckCircle,
  HiDownload,
  HiExternalLink,
  HiLightningBolt,
  HiSparkles,
  HiPhotograph,
  HiVideoCamera
} from 'react-icons/hi';

const MediaConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversionType, setConversionType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [enhance, setEnhance] = useState(false);
  const [resize, setResize] = useState({ enabled: false, width: '', height: '', fit: 'cover' });

  const convertFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setProgress(0);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('outputFormat', outputFormat);
    
    if (conversionType === 'image') {
      formData.append('quality', quality);
      formData.append('enhance', enhance);
      if (resize.enabled && resize.width && resize.height) {
        formData.append('resize', JSON.stringify({
          width: resize.width,
          height: resize.height,
          fit: resize.fit
        }));
      }
    } else {
      formData.append('quality', videoQuality);
    }

    try {
      const endpoint = conversionType === 'image' ? '/api/convert/image' : '/api/convert/video';
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('🔄 Starting conversion:', { type: conversionType, format: outputFormat });
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('✅ Conversion successful:', response.data);
      setResult(response.data);
      
    } catch (error) {
      console.error('❌ Conversion error:', error);
      alert(`Failed to convert file: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const downloadFile = () => {
    if (result?.convertedName || result?.filename) {
      const filename = result.convertedName || result.filename;
      console.log('📥 Downloading file:', filename);
      console.log('📊 Full result object:', result);
      
      // Use the API endpoint
      const downloadUrl = `/api/convert/download/${filename}`;
      
      // Create temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download initiated via:', downloadUrl);
    } else {
      console.error('❌ No file to download - result:', result);
      alert('No file available for download');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);
    
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 content-with-navbar py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🔄 Media Converter Pro
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Convert, enhance, and optimize your media files with professional quality
          </p>
        </div>
        
        <div className="glass-card p-8 rounded-3xl border border-white/20 hover-lift">
          {/* Conversion Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              Choose Conversion Type:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setConversionType('image');
                  setOutputFormat('jpeg');
                }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  conversionType === 'image'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <HiPhotograph className="text-4xl mb-2 mx-auto" />
                <div className="font-bold">Image Conversion</div>
                <div className="text-sm opacity-75">All formats + Enhancement</div>
              </button>
              
              <button
                onClick={() => {
                  setConversionType('video');
                  setOutputFormat('mp4');
                }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  conversionType === 'video'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <HiVideoCamera className="text-4xl mb-2 mx-auto" />
                <div className="font-bold">Video Conversion</div>
                <div className="text-sm opacity-75">All formats + Quality options</div>
              </button>
            </div>
          </div>

          {/* Format and Settings */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Output Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
              >
                {conversionType === 'image' ? (
                  <>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                    <option value="tiff">TIFF</option>
                    <option value="heif">HEIF</option>
                  </>
                ) : (
                  <>
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="wmv">WMV</option>
                    <option value="flv">FLV</option>
                    <option value="3gp">3GP</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {conversionType === 'image' ? `Quality: ${quality}%` : 'Video Quality:'}
              </label>
              {conversionType === 'image' ? (
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              ) : (
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Slow)</option>
                  <option value="ultra">Ultra (Very Slow)</option>
                </select>
              )}
            </div>
          </div>

          {/* Image Enhancement Options */}
          {conversionType === 'image' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                <HiSparkles className="mr-2" />
                Enhancement Options
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enhance}
                      onChange={(e) => setEnhance(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-medium text-purple-700">
                      Auto Enhancement (Sharpen, Normalize, Color boost)
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={resize.enabled}
                      onChange={(e) => setResize({...resize, enabled: e.target.checked})}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-medium text-purple-700">Resize Image</span>
                  </label>
                  
                  {resize.enabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Width"
                        value={resize.width}
                        onChange={(e) => setResize({...resize, width: e.target.value})}
                        className="p-2 border border-purple-200 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={resize.height}
                        onChange={(e) => setResize({...resize, height: e.target.value})}
                        className="p-2 border border-purple-200 rounded-lg text-sm"
                      />
                      <select
                        value={resize.fit}
                        onChange={(e) => setResize({...resize, fit: e.target.value})}
                        className="p-2 border border-purple-200 rounded-lg text-sm"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              Select File:
            </label>
            <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-all duration-300">
              <input
                type="file"
                onChange={handleFileSelect}
                accept={conversionType === 'image' ? 
                  '.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.svg,.heic,.heif,.avif,.jp2,.jxr' : 
                  '.mkv,.avi,.mov,.mp4,.wmv,.flv,.webm,.m4v,.3gp,.ogv'
                }
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📁</div>
                <div className="text-xl font-bold text-gray-700 mb-2">
                  Click to select {conversionType} file
                </div>
                <div className="text-gray-500">
                  Supports all major {conversionType} formats
                </div>
              </label>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="font-medium text-green-800">
                  📄 Selected: {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button
            onClick={convertFile}
            disabled={!selectedFile || loading}
            className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 loading-spinner">
                  <div className="w-full h-full border-3 border-white border-t-transparent rounded-full"></div>
                </div>
                <span>Converting... {progress}%</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <HiLightningBolt />
                <span>Convert & Enhance {conversionType === 'image' ? 'Image' : 'Video'}</span>
              </span>
            )}
          </button>

          {/* Progress Bar */}
          {loading && (
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 animate-fadeInUp">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <HiCheckCircle className="w-6 h-6 mr-3" />
                Conversion Successful! 🎉
                {result.enhanced && <HiSparkles className="w-5 h-5 ml-2 text-purple-600" />}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Original:</p>
                  <p className="font-bold">{result.originalName}</p>
                  <p className="text-sm text-gray-500">{(result.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Converted:</p>
                  <p className="font-bold">{result.convertedName}</p>
                  <p className="text-sm text-gray-500">{(result.convertedSize / 1024 / 1024).toFixed(2)} MB</p>
                  {result.enhanced && <p className="text-xs text-purple-600 font-medium">✨ Enhanced</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadFile}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <HiDownload />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => window.open(`http://localhost:5000${result.downloadUrl}`, '_blank')}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <HiExternalLink />
                  <span>Open File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover-lift">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-800 mb-2">All Formats</h3>
            <p className="text-gray-600 text-sm">Support for all major image and video formats</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover-lift">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-gray-800 mb-2">AI Enhancement</h3>
            <p className="text-gray-600 text-sm">Automatic image enhancement and optimization</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover-lift">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-gray-800 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">Files processed locally and auto-deleted</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover-lift">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="font-bold text-gray-800 mb-2">Pro Quality</h3>
            <p className="text-gray-600 text-sm">Professional-grade conversion algorithms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaConverter;
