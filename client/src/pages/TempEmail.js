import React, { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { 
  IoMail, 
  IoRefresh, 
  IoTrash, 
  IoTime, 
  IoAlert,
  IoSparkles,
  IoStar,
  IoArrowForward,
  IoOpenOutline,
  IoText,
  IoLink,
  IoDownload,
  IoEye,
  IoWarning,
  IoCopy,
  IoPlay
} from 'react-icons/io5';

const TempEmail = () => {
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [apiStatus, setApiStatus] = useState('ready');
  const [customUsername, setCustomUsername] = useState('');
  const [apiProvider, setApiProvider] = useState('1secmail');
  const [isRealEmail, setIsRealEmail] = useState(false);

  const oneSecMailDomains = [
    '1secmail.com',
    '1secmail.org',
    '1secmail.net',
    'wwjmp.com',
    'qiott.com',
    'guerrillamail.info',
    'guerrillamail.biz',
    'guerrillamail.com',
    'guerrillamail.de',
    'guerrillamail.net',
    'guerrillamail.org'
  ];

  const refreshMessagesCallback = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/temp-email/messages/${email}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
      setError('Failed to refresh messages');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    let interval;
    if (autoRefresh && email) {
      interval = setInterval(refreshMessagesCallback, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, email, refreshMessagesCallback]);

  useEffect(() => {
    if (email) {
      refreshMessagesCallback();
    }
  }, [email, refreshMessagesCallback]);

  // Only allow 1secmail-supported domains
  const oneSecMailSupportedDomains = [
    '1secmail.com',
    '1secmail.org',
    '1secmail.net',
    'kzccv.com',
    'qiott.com',
    'uuf.me',
    '1secmail.xyz'
  ];

  useEffect(() => {
    setDomains(oneSecMailSupportedDomains);
    setSelectedDomain(oneSecMailSupportedDomains[0]);
  }, []);

  useEffect(() => {
    if (email && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setEmail('');
            setMessages([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [email, timeLeft]);

  // Auto-refresh messages every 30 seconds when enabled
  useEffect(() => {
    if (email && autoRefresh) {
      const interval = setInterval(() => {
        refreshMessages(true); // Force refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [email, autoRefresh]);

  const fetchDomains = async () => {
    try {
      const response = await api.get('/api/temp-email/domains');
      setDomains(response.data.data || []);
      setSelectedDomain(response.data.data[0] || '');
    } catch (error) {
      console.error('❌ Failed to fetch domains:', error);
    }
  };

  const generateEmail = async () => {
    setLoading(true);
    setError('');
    setApiStatus('generating');

    try {
      const response = await api.post('/api/temp-email/generate', {
        customUsername,
        domain: selectedDomain
      }, {
        timeout: 15000
      });

      const emailData = response.data.data;
      setEmail(emailData.email);
      setTimeLeft(Math.floor((new Date(emailData.expiresAt) - new Date()) / 1000));
      setMessages([]);
      setCustomUsername('');
      setIsRealEmail(true);
      setAutoRefresh(true);
      setApiProvider(emailData.apiProvider || '1secmail');
      setApiStatus('connected');

    } catch (error) {
      console.error('❌ Email generation error:', error);
      setError(error.response?.data?.error || 'Failed to generate email');
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async (forceRefresh = false) => {
    if (!email) return;

    try {
      setApiStatus('fetching');
      let endpoint = `/api/temp-email/${email}/messages`;
      // Always use /messages endpoint, remove auto-refresh logic
      const response = await api.get(endpoint);
      setMessages(response.data.data.messages || []);
      setApiStatus('connected');
      
      // Show API error if any
      if (response.data.data.apiError) {
        console.warn('⚠️ API Warning:', response.data.data.apiError);
      }
    } catch (error) {
      console.error('❌ Failed to refresh messages:', error);
      setApiStatus('error');
    }
  };

  const simulateEmail = async () => {
    if (!email) return;

    try {
      await api.post(`/api/temp-email/${email}/simulate`, {
        from: 'demo@example.com',
        subject: 'Welcome to CreativeForge!',
        body: 'This is a demo email to show how the temporary email system works. Your email is working perfectly!'
      });

      refreshMessages();
    } catch (error) {
      console.error('❌ Failed to simulate email:', error);
    }
  };

  const simulateExternalEmail = async () => {
    if (!email) return;

    try {
      const response = await api.post(`/api/temp-email/${email}/simulate-external`);
      console.log('✅ External email simulated:', response.data);
      refreshMessages();
    } catch (error) {
      console.error('❌ Failed to simulate external email:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 content-with-navbar bg-pattern-dots">
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-orange-100 mb-8 shadow-lg">
            <IoMail className="text-orange-500 animate-bounce-gentle" />
            <span className="text-sm font-semibold gradient-text">10 Minute Email</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">Temp</span>
            <br />
            <span className="text-gray-900">Email</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Get a temporary email address that self-destructs in 10 minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Email Generator Panel */}
          <div className="space-y-8">
            <div className="card-modern animate-slide-up-fade delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <IoMail className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-black gradient-text">Generate Email</h2>
              </div>

              {!email ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">
                      Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={customUsername}
                      onChange={(e) => setCustomUsername(e.target.value)}
                      placeholder="custom-username"
                      className="input-modern"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">
                      Domain
                    </label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="input-modern"
                    >
                      {domains.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={generateEmail}
                      disabled={loading}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating Email...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <IoMail className="text-xl" />
                          <span>Generate Email</span>
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-800 mb-2">📧 1secmail API Integration:</h4>
                    <p className="text-sm text-blue-700">
                      Uses 1secmail API to generate real temporary emails that can receive actual messages from external websites
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Free API:</strong> No registration required, instant email generation
                    </div>
                  </div>

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
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-green-800">Your Temporary Email:</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            apiStatus === 'connected' ? 'bg-green-500' : 
                            apiStatus === 'fetching' ? 'bg-yellow-500' : 
                            apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs font-semibold ${
                            apiStatus === 'connected' ? 'text-green-600' : 
                            apiStatus === 'fetching' ? 'text-yellow-600' : 
                            apiStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                          }">
                            {apiStatus === 'connected' ? 'Connected to 1secmail API' : 
                             apiStatus === 'fetching' ? 'Fetching messages...' : 
                             apiStatus === 'error' ? 'API Error' : 'Connecting...'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-orange-600">
                        <IoTime className="text-lg" />
                        <span className="font-bold">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={email}
                        readOnly
                        className="flex-1 p-3 bg-white border border-green-200 rounded-lg font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(email)}
                        className="btn-secondary"
                      >
                        <IoCopy />
                      </button>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => refreshMessages(true)}
                        className="btn-secondary flex-1"
                      >
                        <IoRefresh className="mr-2" />
                        Refresh Messages
                      </button>
                      
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                          autoRefresh 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span>Auto Refresh</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={simulateExternalEmail}
                        className="btn-primary flex-1"
                      >
                        <IoPlay className="mr-2" />
                        Test Email
                      </button>
                    </div>
                    
                    {/* API Status */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">API Provider:</span>
                        <span className="font-semibold text-blue-600">{apiProvider || '1secmail'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ${
                          apiStatus === 'connected' ? 'text-green-600' : 
                          apiStatus === 'fetching' ? 'text-yellow-600' : 
                          apiStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {apiStatus === 'connected' ? 'Connected' : 
                           apiStatus === 'fetching' ? 'Fetching' : 
                           apiStatus === 'error' ? 'Error' : 'Idle'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEmail('');
                      setMessages([]);
                      setTimeLeft(0);
                    }}
                    className="btn-secondary w-full"
                  >
                    <IoTrash className="mr-2" />
                    Delete Email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="space-y-8">
            {email ? (
              <div className="card-modern animate-slide-up-fade delay-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black gradient-text">Inbox</h2>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                    {messages.length} messages
                  </span>
                </div>

                {messages.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-400">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800">{message.subject}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.receivedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          From: {message.from}
                        </div>
                        <div className="text-gray-700">
                          {message.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <IoMail className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">No messages yet</h3>
                    <p className="text-gray-400">Messages will appear here when received</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-300">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoMail className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Generate Email First</h3>
                <p className="text-gray-500 text-body">Create a temporary email to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempEmail;