import React, { useState } from 'react';
import api from '../config/api';
import { 
  IoCheckmarkCircle,
  IoAlert,
  IoCloudUpload,
  IoDownload,
  IoRefresh
} from 'react-icons/io5';

const TestFeatures = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testEndpoints = [
    { name: 'Convert Route', endpoint: '/api/convert', method: 'GET' },
    { name: 'Documents Route', endpoint: '/api/documents', method: 'GET' },
    { name: 'Available Routes', endpoint: '/api/routes', method: 'GET' }
  ];

  const testAllEndpoints = async () => {
    setLoading(true);
    setError('');
    const newResults = {};

    for (const test of testEndpoints) {
      try {
        console.log(`🧪 Testing ${test.name}...`);
        const response = await api.get(test.endpoint);
        newResults[test.name] = {
          success: true,
          data: response.data,
          status: response.status
        };
        console.log(`✅ ${test.name} passed:`, response.data);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error);
        newResults[test.name] = {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message,
          status: error.response?.status
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const testImageConversion = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a simple test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 1, 1);
      
      canvas.toBlob(async (blob) => {
        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('files', testFile);
        formData.append('format', 'jpg');

        console.log('🧪 Testing image conversion...');
        const response = await api.post('/api/convert/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        console.log('✅ Image conversion test response:', response.data);
        setResults(prev => ({
          ...prev,
          'Image Conversion Test': {
            success: true,
            data: response.data,
            status: response.status
          }
        }));

        setLoading(false);
      }, 'image/png');

    } catch (error) {
      console.error('❌ Image conversion test failed:', error);
      setResults(prev => ({
        ...prev,
        'Image Conversion Test': {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message,
          status: error.response?.status
        }
      }));
      setLoading(false);
    }
  };

  const testDocumentProcessing = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a simple test PDF (just a text file for testing)
      const testContent = 'This is a test document for processing.';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('files', testFile);

      console.log('🧪 Testing document processing...');
      const response = await api.post('/api/documents/pdf-to-docx', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('✅ Document processing test response:', response.data);
      setResults(prev => ({
        ...prev,
        'Document Processing Test': {
          success: true,
          data: response.data,
          status: response.status
        }
      }));

      setLoading(false);

    } catch (error) {
      console.error('❌ Document processing test failed:', error);
      setResults(prev => ({
        ...prev,
        'Document Processing Test': {
          success: false,
          error: error.response?.data?.error || error.response?.data?.message || error.message,
          status: error.response?.status
        }
      }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 content-with-navbar">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4 text-display">
            <span className="gradient-text-flow">Feature</span>
            <span className="text-gray-900"> Tests</span>
          </h1>
          <p className="text-lg text-gray-600">
            Test Media Conversion and Document Processing functionality
          </p>
        </div>

        {/* Test Controls */}
        <div className="card-modern mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Test Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={testAllEndpoints}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <IoRefresh className={loading ? 'animate-spin' : ''} />
                <span>Test Endpoints</span>
              </button>
              
              <button
                onClick={testImageConversion}
                disabled={loading}
                className="btn-secondary flex items-center space-x-2"
              >
                <IoCloudUpload className={loading ? 'animate-spin' : ''} />
                <span>Test Image Conversion</span>
              </button>

              <button
                onClick={testDocumentProcessing}
                disabled={loading}
                className="btn-secondary flex items-center space-x-2"
              >
                <IoDownload className={loading ? 'animate-spin' : ''} />
                <span>Test Document Processing</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl mb-4">
              <div className="flex items-center text-red-700">
                <IoAlert className="mr-3 text-xl" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {Object.keys(results).map((testName) => {
            const result = results[testName];
            return (
              <div key={testName} className="card-modern">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{testName}</h3>
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <IoCheckmarkCircle className="text-green-500 text-xl" />
                    ) : (
                      <IoAlert className="text-red-500 text-xl" />
                    )}
                    <span className={`text-sm font-semibold ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  {result.success ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status: {result.status}</p>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status: {result.status}</p>
                      <p className="text-red-600 font-semibold">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="card-modern mt-8">
          <h3 className="text-lg font-bold mb-4">How to Test</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Click "Test Endpoints" to verify backend routes are working</p>
            <p>2. Click "Test Image Conversion" to verify file upload and conversion</p>
            <p>3. Click "Test Document Processing" to verify document functionality</p>
            <p>4. Check the results below for any errors</p>
            <p>5. If all tests pass, the features should work in the main application</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TestFeatures; 