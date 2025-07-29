import React, { useState } from 'react';
import api from '../config/api';

const FeatureTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testFeature = async (featureName, endpoint, method = 'GET', data = null) => {
    setLoading(true);
    setResults(prev => ({ ...prev, [featureName]: { status: 'Testing...', data: null, error: null } }));
    
    try {
      let response;
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else if (method === 'POST') {
        response = await api.post(endpoint, data);
      }
      
      setResults(prev => ({ 
        ...prev, 
        [featureName]: { 
          status: '✅ Success', 
          data: response.data, 
          error: null 
        } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [featureName]: { 
          status: '❌ Failed', 
          data: null, 
          error: error.message 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAllFeatures = async () => {
    setLoading(true);
    
    // Test each feature
    await testFeature('Health Check', '/api/health');
    await testFeature('API Test', '/api/test');
    await testFeature('Available Routes', '/api/routes');
    await testFeature('Images List', '/api/images');
    await testFeature('QR Generator', '/api/qr');
    await testFeature('URL Shortener', '/api/url');
    await testFeature('Temp Email', '/api/temp-email');
    await testFeature('Documents', '/api/documents');
    await testFeature('Convert', '/api/convert');
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Feature Test Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test All Features</h2>
          <button 
            onClick={testAllFeatures}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing All Features...' : 'Test All Features'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(results).map(([feature, result]) => (
            <div key={feature} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">{feature}</h3>
              <div className="mb-3">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  result.status === '✅ Success' ? 'bg-green-100 text-green-800' :
                  result.status === '❌ Failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.error && (
                <div className="mb-3">
                  <p className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </p>
                </div>
              )}
              
              {result.data && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Response:</strong>
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Backend Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Backend URL</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                https://creative-forge-creative-studio-back.vercel.app
              </p>
            </div>
            <div>
              <h3 className="font-semibold">API Base URL</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {api.defaults.baseURL}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTest; 