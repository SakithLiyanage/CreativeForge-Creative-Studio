import React, { useState } from 'react';

const SimpleTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await fetch('https://creative-forge-creative-studio-back.vercel.app/api/health');
      const data = await response.json();
      setResult(`✅ Success! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Simple Backend Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Direct Fetch Test</h2>
          <button 
            onClick={testBackend}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Backend'}
          </button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Backend URL</h2>
          <p className="text-lg font-mono bg-gray-100 p-2 rounded">
            https://creative-forge-creative-studio-back.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest; 