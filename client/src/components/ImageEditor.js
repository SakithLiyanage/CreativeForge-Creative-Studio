import React, { useState, useRef } from 'react';
import { 
  HiPhotograph, 
  HiAdjustments, 
  HiColorSwatch, 
  HiSparkles,
  HiDownload,
  HiRefresh,
  HiEye
} from 'react-icons/hi';

const ImageEditor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0
  });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilters = () => {
    if (!selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.filter = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px) 
      hue-rotate(${filters.hue}deg)
    `;

    ctx.drawImage(img, 0, 0);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 content-with-navbar py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎨 Image Editor Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional image editing tools at your fingertips
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="glass-ultra p-8 rounded-3xl border border-white/20 hover-lift">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <HiAdjustments className="mr-3 text-purple-600" />
              Adjustments
            </h3>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Upload Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
              />
            </div>

            {/* Filter Controls */}
            <div className="space-y-6">
              {Object.entries(filters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key}: {value}{key === 'brightness' || key === 'contrast' || key === 'saturation' ? '%' : key === 'blur' ? 'px' : '°'}
                  </label>
                  <input
                    type="range"
                    min={key === 'brightness' || key === 'contrast' || key === 'saturation' ? 0 : key === 'blur' ? 0 : -180}
                    max={key === 'brightness' || key === 'contrast' || key === 'saturation' ? 200 : key === 'blur' ? 10 : 180}
                    value={value}
                    onChange={(e) => setFilters({...filters, [key]: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={applyFilters}
                disabled={!selectedImage}
                className="flex-1 btn-ultra bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
              >
                <HiSparkles className="inline mr-2" />
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 btn-ultra bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold"
              >
                <HiRefresh className="inline mr-2" />
                Reset
              </button>
            </div>

            <button
              onClick={downloadImage}
              disabled={!selectedImage}
              className="w-full mt-4 btn-ultra bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
            >
              <HiDownload className="inline mr-2" />
              Download
            </button>
          </div>

          {/* Image Preview */}
          <div className="lg:col-span-2 glass-ultra p-8 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <HiEye className="mr-3 text-blue-600" />
              Preview
            </h3>

            <div className="relative bg-gray-100 rounded-2xl min-h-96 flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <>
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Original"
                    className="max-w-full max-h-96 object-contain"
                    onLoad={applyFilters}
                    style={{
                      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) hue-rotate(${filters.hue}deg)`
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <HiPhotograph className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-xl font-medium">Upload an image to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
