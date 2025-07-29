import React, { useState, useEffect } from 'react';
import api from '../config/api';

const BackendTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testBackend = async () => {
      try {
        setStatus('Connecting to backend...');
        const response = await api.get('/api/health');
        setData(response.data);
        setStatus('✅ Backend connected successfully!');
        setError(null);
      } catch (err) {
        setError(err.message);
        setStatus('❌ Backend connection failed');
        console.error('Backend test error:', err);
      }
    };

    testBackend();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Backend Connection Test</h3>
      <p className="text-sm text-gray-600 mb-2">{status}</p>
      
      {data && (
        <div className="mt-2">
          <p className="text-green-600">✅ Backend is running!</p>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-2">
          <p className="text-red-600">❌ Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default BackendTest; 