import React, { useState } from 'react';
import api from '../config/api';

const ConnectionTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', method: 'GET', url: '/api/health' },
    { name: 'API Test', method: 'GET', url: '/api/test' },
    { name: 'Images List', method: 'GET', url: '/api/images' },
    { name: 'QR Status', method: 'GET', url: '/api/qr' },
    { name: 'URL Shortener Status', method: 'GET', url: '/api/url' },
    { name: 'Temp Email Status', method: 'GET', url: '/api/temp-email' },
    { name: 'Documents Status', method: 'GET', url: '/api/documents' },
    { name: 'Convert Status', method: 'GET', url: '/api/convert' },
    { name: 'Image Generation', method: 'POST', url: '/api/images/generate', data: { prompt: 'test image' } },
    { name: 'QR Generation', method: 'POST', url: '/api/qr/generate', data: { content: 'test', type: 'text' } }
  ];

  const runTests = async () => {
    setLoading(true);
    const newResults = {};

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing ${endpoint.name}...`);
        let response;
        
        if (endpoint.method === 'GET') {
          response = await api.get(endpoint.url);
        } else if (endpoint.method === 'POST') {
          response = await api.post(endpoint.url, endpoint.data);
        }

        newResults[endpoint.name] = {
          status: '✅ Success',
          data: response.data,
          statusCode: response.status
        };
      } catch (error) {
        newResults[endpoint.name] = {
          status: '❌ Failed',
          error: error.message,
          statusCode: error.response?.status,
          data: error.response?.data
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Frontend-Backend Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Base URL</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {api.defaults.baseURL}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Environment</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {process.env.NODE_ENV}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test All Endpoints</h2>
          <button 
            onClick={runTests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testEndpoints.map((endpoint) => (
            <div key={endpoint.name} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">{endpoint.name}</h3>
              <div className="mb-3">
                <span className="text-sm font-mono bg-gray-100 p-1 rounded">
                  {endpoint.method} {endpoint.url}
                </span>
              </div>
              
              {results[endpoint.name] && (
                <div>
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results[endpoint.name].status === '✅ Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {results[endpoint.name].status}
                    </span>
                    {results[endpoint.name].statusCode && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({results[endpoint.name].statusCode})
                      </span>
                    )}
                  </div>
                  
                  {results[endpoint.name].error && (
                    <div className="mb-3">
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {results[endpoint.name].error}
                      </p>
                    </div>
                  )}
                  
                  {results[endpoint.name].data && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Response:</strong>
                      </p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(results[endpoint.name].data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest; 