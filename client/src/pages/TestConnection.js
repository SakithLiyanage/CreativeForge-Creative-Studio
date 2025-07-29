import React, { useState, useEffect } from 'react';
import api from '../config/api';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [healthData, setHealthData] = useState(null);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  const testHealth = async () => {
    try {
      setStatus('Testing health endpoint...');
      const response = await api.get('/api/health');
      setHealthData(response.data);
      setStatus('✅ Health check successful!');
      setError(null);
    } catch (err) {
      setError(`Health check failed: ${err.message}`);
      setStatus('❌ Health check failed');
      console.error('Health check error:', err);
    }
  };

  const testAPI = async () => {
    try {
      setStatus('Testing API endpoint...');
      const response = await api.get('/api/test');
      setTestData(response.data);
      setStatus('✅ API test successful!');
      setError(null);
    } catch (err) {
      setError(`API test failed: ${err.message}`);
      setStatus('❌ API test failed');
      console.error('API test error:', err);
    }
  };

  useEffect(() => {
    testHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Backend Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              onClick={testHealth}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Health
            </button>
            <button 
              onClick={testAPI}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Test API
            </button>
          </div>
        </div>

        {healthData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Health Check Response</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        {testData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">API Test Response</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Backend URL</h2>
          <p className="text-lg font-mono bg-gray-100 p-2 rounded">
            https://creative-forge-creative-studio-backend-h6q5dxs3u.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestConnection; 