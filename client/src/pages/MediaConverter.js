import React, { useState } from 'react';
import api from '../config/api';
import { 
  IoSwapHorizontal,
  IoImages,
  IoVideocam,
  IoMusicalNotes,
  IoDownload,
  IoCheckmarkCircle,
  IoAlert,
  IoCloudUpload,
  IoSettings,
  IoStar,
  IoResize,
  IoColorPalette
} from 'react-icons/io5';

const MediaConverter = () => {
  const [activeType, setActiveType] = useState('image');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [conversionOptions, setConversionOptions] = useState({
    format: 'png',
    quality: 90,
    width: '',
    height: '',
    maintainAspectRatio: true
  });

  const mediaTypes = [
    { 
      id: 'image', 
      label: 'Images', 
      icon: IoImages, 
      description: 'Convert between image formats',
      formats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'TIFF'],
      acceptedFiles: '.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp'
    },
    { 
      id: 'video', 
      label: 'Videos', 
      icon: IoVideocam, 
      description: 'Convert video formats and compress',
      formats: ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV'],
      acceptedFiles: '.mp4,.avi,.mov,.wmv,.flv,.mkv'
    },
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: IoMusicalNotes, 
      description: 'Convert audio formats and quality',
      formats: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG'],
      acceptedFiles: '.mp3,.wav,.aac,.flac,.ogg'
    }
  ];

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setResults([]);
    setError('');
  };

  const convertMedia = async () => {
    if (files.length === 0) {
      setError('Please select files to convert');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('🔄 Starting conversion...', {
        activeType,
        fileCount: files.length,
        options: conversionOptions
      });

      const formData = new FormData();
      
      // Add files with correct field name - try both approaches
      files.forEach((file, index) => {
        formData.append('files', file); // Array approach
        console.log(`📁 Added file ${index + 1}:`, file.name, file.type, file.size);
      });
      
      // Also add conversion options
      Object.keys(conversionOptions).forEach(key => {
        if (conversionOptions[key] !== '' && conversionOptions[key] !== null && conversionOptions[key] !== undefined) {
          formData.append(key, conversionOptions[key]);
          console.log(`⚙️ Added option ${key}:`, conversionOptions[key]);
        }
      });

      // Debug FormData contents
      console.log('📝 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const endpoint = `/api/convert/${activeType}`;
      console.log('🎯 Calling endpoint:', endpoint);

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('📊 Upload progress:', percentCompleted + '%');
        }
      });

      console.log('✅ Conversion response:', response.data);

      if (response.data.success) {
        setResults(response.data.results || []);
        setFiles([]);
      } else {
        throw new Error(response.data.message || 'Conversion failed');
      }

    } catch (error) {
      console.error('❌ Conversion error:', error);
      
      let errorMessage = 'Conversion failed. ';
      
      if (error.response?.status === 400) {
        errorMessage += error.response.data?.error || 'Invalid request.';
        if (error.response.data?.debug) {
          console.log('🐛 Debug info:', error.response.data.debug);
        }
      } else if (error.response?.status === 413) {
        errorMessage += 'File too large. Please try smaller files.';
      } else if (error.response?.status === 500) {
        errorMessage += error.response.data?.message || 'Server error occurred.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try smaller files or check your connection.';
      } else {
        errorMessage += error.response?.data?.message || error.message || 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filename, downloadUrl) => {
    try {
      console.log('📥 Starting download for:', filename);
      
      // If it's a CloudConvert URL, download directly
      if (downloadUrl && downloadUrl.startsWith('http')) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ CloudConvert download initiated:', filename);
        return;
      }
      
      // Otherwise, download from local server
      const response = await fetch(`/api/convert/download/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Local download completed:', filename);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setError(`Download failed: ${error.message}`);
    }
  };

  const activeMediaType = mediaTypes.find(t => t.id === activeType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 content-with-navbar bg-pattern-dots">
      
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full animate-float-elegant blur-3xl"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-indigo-200/15 to-purple-200/15 rounded-full animate-float-elegant delay-300 blur-2xl"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 rounded-full animate-float-elegant delay-600 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full border border-cyan-100 mb-12 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <IoSwapHorizontal className="text-white animate-pulse" />
            </div>
            <span className="text-sm font-bold gradient-text">Professional Media Converter</span>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
              <span className="text-xs font-bold text-blue-700">⚡ Fast</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">Media</span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Converter</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Convert images, videos, and audio files with professional quality and lightning-fast speed
          </p>
        </div>

        {/* Media Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {mediaTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveType(type.id);
                setFiles([]);
                setResults([]);
                setError('');
                setConversionOptions({
                  format: type.formats[0].toLowerCase(),
                  quality: 90,
                  width: '',
                  height: '',
                  maintainAspectRatio: true
                });
              }}
              className={`group relative p-8 rounded-3xl transition-all duration-500 text-center ${
                activeType === type.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl scale-105'
                  : 'card-modern hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <type.icon className={`text-5xl mx-auto mb-4 ${
                  activeType === type.id ? 'text-white' : 'text-cyan-500'
                } group-hover:scale-110 transition-transform duration-300`} />
                
                <h3 className={`text-2xl font-black mb-2 ${
                  activeType === type.id ? 'text-white' : 'gradient-text'
                }`}>
                  {type.label}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  activeType === type.id ? 'text-cyan-100' : 'text-gray-600'
                }`}>
                  {type.description}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {type.formats.slice(0, 4).map((format) => (
                    <span
                      key={format}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activeType === type.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Conversion Panel */}
          <div className="space-y-8">
            <div className="card-modern animate-slide-up-fade delay-150 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <activeMediaType.icon className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black gradient-text">Convert {activeMediaType.label}</h2>
                  <p className="text-gray-600">{activeMediaType.description}</p>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-4 text-lg">
                  Select Files:
                </label>
                <div className="relative border-3 border-dashed border-cyan-300 rounded-3xl p-12 text-center hover:border-cyan-400 transition-all duration-300 bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={activeMediaType.acceptedFiles}
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <IoCloudUpload className="text-8xl text-cyan-400 mx-auto mb-6" />
                  <div className="text-2xl font-bold text-gray-700 mb-3">
                    Drop files here or click to browse
                  </div>
                  <div className="text-gray-500 text-lg">
                    Supported: {activeMediaType.formats.join(', ')}
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
                        <activeMediaType.icon className="text-cyan-500 text-2xl" />
                        <div className="flex-1">
                          <span className="font-bold text-cyan-900">{file.name}</span>
                          <div className="text-sm text-cyan-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversion Options */}
              <div className="bg-gradient-to-r from-gray-50 to-cyan-50 p-6 rounded-3xl mb-8">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center text-xl">
                  <IoSettings className="mr-3 text-cyan-500" />
                  Conversion Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Output Format</label>
                    <select
                      value={conversionOptions.format}
                      onChange={(e) => setConversionOptions({...conversionOptions, format: e.target.value})}
                      className="input-modern"
                    >
                      {activeMediaType.formats.map(format => (
                        <option key={format} value={format.toLowerCase()}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quality</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={conversionOptions.quality}
                        onChange={(e) => setConversionOptions({...conversionOptions, quality: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="font-bold text-cyan-600 w-12">{conversionOptions.quality}%</span>
                    </div>
                  </div>
                  
                  {activeType === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Width (px)</label>
                        <input
                          type="number"
                          value={conversionOptions.width}
                          onChange={(e) => setConversionOptions({...conversionOptions, width: e.target.value})}
                          placeholder="Auto"
                          className="input-modern"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Height (px)</label>
                        <input
                          type="number"
                          value={conversionOptions.height}
                          onChange={(e) => setConversionOptions({...conversionOptions, height: e.target.value})}
                          placeholder="Auto"
                          className="input-modern"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={convertMedia}
                disabled={loading || files.length === 0}
                className="btn-primary w-full text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Converting Media...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <IoSwapHorizontal className="text-2xl" />
                    <span>Convert {activeMediaType.label}</span>
                  </div>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-6 bg-red-50 border-l-4 border-red-400 rounded-r-3xl animate-slide-up-fade">
                  <div className="flex items-center text-red-700">
                    <IoAlert className="mr-4 text-2xl" />
                    <div>
                      <strong>Conversion Failed:</strong> {error}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-8">
            {results.length > 0 ? (
              <div className="card-modern animate-slide-up-fade delay-300 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <IoCheckmarkCircle className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-black gradient-text">Conversion Complete!</h2>
                </div>

                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-3xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-green-800 text-lg mb-2">{result.filename}</div>
                          <div className="text-sm text-green-600 space-y-1">
                            <div>Format: {result.format?.toUpperCase()}</div>
                            <div>Size: {result.fileSize ? `${(result.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</div>
                            {result.dimensions && (
                              <div>Dimensions: {result.dimensions}</div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(result.filename, result.downloadUrl)}
                          className="btn-primary"
                        >
                          <IoDownload className="mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6 text-green-600 font-bold text-lg">
                  ✨ {results.length} file(s) converted successfully!
                </div>
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-300 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <IoSwapHorizontal className="text-gray-400 text-5xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Ready to Convert</h3>
                <p className="text-gray-500 text-body text-lg">Upload your media files and start converting</p>
              </div>
            )}

            {/* Features Showcase */}
            <div className="card-modern bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-slide-up-fade delay-500">
              <h3 className="font-bold gradient-text mb-6 text-2xl flex items-center">
                <IoStar className="text-yellow-500 mr-3" />
                Conversion Features
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center">
                  <IoResize className="text-cyan-500 mr-3" />
                  <span>Custom dimensions and quality control</span>
                </li>
                <li className="flex items-center">
                  <IoColorPalette className="text-purple-500 mr-3" />
                  <span>Advanced format options</span>
                </li>
                <li className="flex items-center">
                  <IoSettings className="text-blue-500 mr-3" />
                  <span>Batch processing support</span>
                </li>
                <li className="flex items-center">
                  <IoCheckmarkCircle className="text-green-500 mr-3" />
                  <span>Professional quality output</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaConverter;
