import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { 
  IoLink, 
  IoSparkles, 
  IoCheckmarkCircle, 
  IoAlert, 
  IoDownload, 
  IoStar,
  IoArrowForward,
  IoOpenOutline,
  IoText,
  IoMail,
  IoCall,
  IoWifi,
  IoLocation,
  IoTime,
  IoAnalytics,
  IoCopy,
  IoBarChart
} from 'react-icons/io5';

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [recentUrls, setRecentUrls] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchRecentUrls();
  }, []);

  const fetchRecentUrls = async () => {
    try {
      const response = await api.get('/api/url/my-urls');
      setRecentUrls(response.data.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch URLs:', error);
    }
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/url/shorten', {
        originalUrl,
        customCode: customCode || undefined
      });

      setResult(response.data.data);
      setOriginalUrl('');
      setCustomCode('');
      fetchRecentUrls();

    } catch (error) {
      console.error('❌ URL shortening error:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
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

  const getAnalytics = async (shortCode) => {
    try {
      const response = await api.get(`/api/url/analytics/${shortCode}`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 content-with-navbar bg-pattern-dots">
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-100 mb-8 shadow-lg">
            <IoLink className="text-purple-500 animate-bounce-gentle" />
            <span className="text-sm font-semibold gradient-text">URL Shortener</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">Short</span>
            <br />
            <span className="text-gray-900">Links</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Create short, memorable links with detailed analytics and click tracking
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* URL Shortener Panel */}
          <div className="space-y-8">
            <div className="card-modern animate-slide-up-fade delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <IoLink className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-black gradient-text">Shorten URL</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Original URL
                  </label>
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    Custom Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="my-custom-link"
                    className="input-modern"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for auto-generated code
                  </p>
                </div>

                <button
                  onClick={shortenUrl}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Shortening URL...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <IoLink className="text-xl" />
                      <span>Shorten URL</span>
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

            {/* Recent URLs */}
            {recentUrls.length > 0 && (
              <div className="card-modern animate-slide-up-fade delay-300">
                <h3 className="font-bold gradient-text mb-4 flex items-center">
                  <IoTime className="mr-2" />
                  Recent URLs
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentUrls.slice(0, 5).map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{url.shortUrl}</p>
                        <p className="text-sm text-gray-500 truncate">{url.originalUrl}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{url.clicks} clicks</span>
                        <button
                          onClick={() => getAnalytics(url.shortCode)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                        >
                          <IoAnalytics />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="space-y-8">
            {result ? (
              <div className="card-modern animate-slide-up-fade delay-450">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <IoCheckmarkCircle className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-black gradient-text">URL Shortened!</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border border-green-100">
                    <label className="block text-sm font-bold text-green-800 mb-2">Short URL:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={result.shortUrl}
                        readOnly
                        className="flex-1 p-2 bg-white border border-green-200 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(result.shortUrl)}
                        className="btn-secondary"
                      >
                        <IoCopy />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Original URL:</label>
                    <p className="text-gray-600 break-all">{result.originalUrl}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{result.clicks}</div>
                      <div className="text-sm text-purple-700">Clicks</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{result.shortCode}</div>
                      <div className="text-sm text-blue-700">Short Code</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-450">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoLink className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Ready to Shorten</h3>
                <p className="text-gray-500 text-body">Enter a URL to create a short link</p>
              </div>
            )}

            {/* Analytics Panel */}
            {analytics && (
              <div className="card-modern animate-slide-up-fade delay-600">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <IoBarChart className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-black gradient-text">Analytics</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-blue-600">{analytics.clicks}</div>
                      <div className="text-sm text-blue-700">Total Clicks</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {new Date(analytics.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-green-700">Created</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2">Recent Clicks:</h4>
                    {analytics.clickHistory.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {analytics.clickHistory.map((click, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {new Date(click.timestamp).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No clicks yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;
