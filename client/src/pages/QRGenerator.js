import React, { useState } from 'react';
import api from '../config/api';
import { 
  IoQrCode, 
  IoDownload, 
  IoColorPalette, 
  IoSettings, 
  IoCheckmarkCircle,
  IoAlert,
  IoSparkles,
  IoStar,
  IoArrowForward,
  IoOpenOutline,
  IoText,
  IoLink,
  IoMail,
  IoCall,
  IoWifi,
  IoLocation,
  IoPerson,
  IoCopy
} from 'react-icons/io5';

const QRGenerator = () => {
  const [activeType, setActiveType] = useState('text');
  const [content, setContent] = useState('');
  const [formData, setFormData] = useState({});
  const [options, setOptions] = useState({
    size: 512,
    errorCorrectionLevel: 'M',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 4
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [batchItems, setBatchItems] = useState([]);

  const qrTypes = [
    { id: 'text', label: 'Text', icon: IoText, description: 'Plain text content' },
    { id: 'url', label: 'Website', icon: IoLink, description: 'Website URL or link' },
    { id: 'email', label: 'Email', icon: IoMail, description: 'Email address' },
    { id: 'phone', label: 'Phone', icon: IoCall, description: 'Phone number' },
    { id: 'wifi', label: 'WiFi', icon: IoWifi, description: 'WiFi network credentials' },
    { id: 'vcard', label: 'Contact', icon: IoPerson, description: 'Contact information' },
    { id: 'location', label: 'Location', icon: IoLocation, description: 'GPS coordinates' }
  ];

  const generateQR = async () => {
    if (!getContentForType()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/qr/generate', {
        content: getContentForType(),
        type: activeType,
        ...options
      });

      setResult(response.data);
      setContent('');
      setFormData({});

    } catch (error) {
      console.error('❌ QR generation error:', error);
      setError(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const getContentForType = () => {
    switch (activeType) {
      case 'text':
        return content;
      case 'url':
        return content;
      case 'email':
        return content;
      case 'phone':
        return content;
      case 'wifi':
        return JSON.stringify({
          ssid: formData.ssid || '',
          password: formData.password || '',
          security: formData.security || 'WPA'
        });
      case 'vcard':
        return JSON.stringify({
          name: formData.name || '',
          phone: formData.phone || '',
          email: formData.email || '',
          organization: formData.organization || ''
        });
      case 'location':
        return JSON.stringify({
          latitude: formData.latitude || '',
          longitude: formData.longitude || ''
        });
      default:
        return content;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQR = () => {
    if (result?.filename) {
      const link = document.createElement('a');
      link.href = `/api/qr/download/${result.filename}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContentForm = () => {
    switch (activeType) {
      case 'text':
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text content..."
            className="input-modern resize-none"
            rows="4"
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="https://example.com"
            className="input-modern"
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="contact@example.com"
            className="input-modern"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="+1234567890"
            className="input-modern"
          />
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.ssid || ''}
              onChange={(e) => setFormData({...formData, ssid: e.target.value})}
              placeholder="WiFi Network Name (SSID)"
              className="input-modern"
            />
            <input
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="WiFi Password"
              className="input-modern"
            />
            <select
              value={formData.security || 'WPA'}
              onChange={(e) => setFormData({...formData, security: e.target.value})}
              className="input-modern"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Full Name"
              className="input-modern"
            />
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Phone Number"
              className="input-modern"
            />
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email Address"
              className="input-modern"
            />
            <input
              type="text"
              value={formData.organization || ''}
              onChange={(e) => setFormData({...formData, organization: e.target.value})}
              placeholder="Organization"
              className="input-modern"
            />
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <input
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              placeholder="Latitude (e.g., 37.7749)"
              className="input-modern"
            />
            <input
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              placeholder="Longitude (e.g., -122.4194)"
              className="input-modern"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 content-with-navbar bg-pattern-dots">
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 mb-8 shadow-lg">
            <IoQrCode className="text-blue-500 animate-bounce-gentle" />
            <span className="text-sm font-semibold gradient-text">QR Code Generator</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">QR Code</span>
            <br />
            <span className="text-gray-900">Generator</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Create professional QR codes for websites, contact info, WiFi, and more
          </p>
        </div>

        {/* QR Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          {qrTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveType(type.id);
                setContent('');
                setFormData({});
                setResult(null);
                setError('');
              }}
              className={`p-4 rounded-2xl transition-all duration-300 text-center ${
                activeType === type.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'card-modern hover:shadow-lg'
              }`}
            >
              <type.icon className={`text-2xl mx-auto mb-2 ${
                activeType === type.id ? 'text-white' : 'text-blue-500'
              }`} />
              <h3 className={`font-bold text-sm ${
                activeType === type.id ? 'text-white' : 'text-gray-900'
              }`}>
                {type.label}
              </h3>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Generator Panel */}
          <div className="space-y-8">
            <div className="card-modern animate-slide-up-fade delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <IoQrCode className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black gradient-text">Generate QR Code</h2>
                  <p className="text-gray-600 text-sm">
                    {qrTypes.find(t => t.id === activeType)?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Content:
                  </label>
                  {renderContentForm()}
                </div>

                {/* Customization Options */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <IoColorPalette className="mr-2" />
                    Customization
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select
                        value={options.size}
                        onChange={(e) => setOptions({...options, size: parseInt(e.target.value)})}
                        className="input-modern"
                      >
                        <option value={256}>256x256</option>
                        <option value={512}>512x512</option>
                        <option value={1024}>1024x1024</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Error Correction</label>
                      <select
                        value={options.errorCorrectionLevel}
                        onChange={(e) => setOptions({...options, errorCorrectionLevel: e.target.value})}
                        className="input-modern"
                      >
                        <option value="L">Low</option>
                        <option value="M">Medium</option>
                        <option value="Q">Quartile</option>
                        <option value="H">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color</label>
                      <input
                        type="color"
                        value={options.color}
                        onChange={(e) => setOptions({...options, color: e.target.value})}
                        className="w-full h-12 rounded-xl border-2 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <input
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) => setOptions({...options, backgroundColor: e.target.value})}
                        className="w-full h-12 rounded-xl border-2 border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating QR Code...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <IoQrCode className="text-xl" />
                      <span>Generate QR Code</span>
                    </div>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl animate-slide-up-fade">
                    <div className="flex items-center text-red-700">
                      <IoAlert className="mr-3 text-xl" />
                      <div>
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-8">
            {result ? (
              <div className="card-modern animate-slide-up-fade delay-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <IoCheckmarkCircle className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-black gradient-text">QR Code Generated!</h2>
                </div>

                {/* QR Code Display */}
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                    <img
                      src={result.qrCode}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                </div>

                {/* QR Code Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Type:</strong> {activeType}</div>
                    <div><strong>Size:</strong> {options.size}x{options.size}</div>
                    <div><strong>File Size:</strong> {(result.fileSize / 1024).toFixed(2)} KB</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={downloadQR}
                    className="btn-primary"
                  >
                    <IoDownload className="mr-2" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(result.content)}
                    className="btn-secondary"
                  >
                    <IoCopy className="mr-2" />
                    Copy Content
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-300">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoQrCode className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Ready to Generate</h3>
                <p className="text-gray-500 text-body">Fill in the content and create your QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
