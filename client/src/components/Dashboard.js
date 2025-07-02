import React, { useState, useEffect } from 'react';
import { 
  IoSparkles, 
  IoImages, 
  IoVideocam,
  IoStatsChart,
  IoTrendingUp,
  IoTime,
  IoServer,
  IoHeart,
  IoEye,
  IoDownload,
  IoStar,
  IoSwapHorizontal,
  IoDocumentText
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ParallaxSection from './ParallaxSection';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalImages: 0,
    imagesThisMonth: 0,
    imagesThisWeek: 0,
    totalConversions: 0,
    conversionsThisMonth: 0,
    storageUsed: 0,
    totalProjects: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/stats');
      const data = response.data.stats;
      setStats(data);
      setRecentActivity(response.data.recentActivity);
      
      // Animate counters
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'number') {
          animateCounter(data[key], key);
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to demo data if backend is not available
      const demoStats = {
        totalImages: 1247,
        imagesThisMonth: 156,
        imagesThisWeek: 42,
        totalConversions: 856,
        conversionsThisMonth: 98,
        storageUsed: 245,
        totalProjects: 2103
      };
      setStats(demoStats);
      Object.keys(demoStats).forEach(key => {
        animateCounter(demoStats[key], key);
      });
    } finally {
      setLoading(false);
    }
  };

  const animateCounter = (target, key, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(start) }));
    }, 16);
  };

  const tools = [
    {
      name: 'AI Image Generator',
      description: 'Create stunning images with DALL-E 3 AI technology',
      icon: IoSparkles,
      color: 'from-purple-500 to-pink-500',
      path: '/generate',
      popular: true,
      count: animatedStats.totalImages || 0
    },
    {
      name: 'Media Converter Pro',
      description: 'Convert images & videos with professional quality',
      icon: IoVideocam,
      color: 'from-blue-500 to-teal-500',
      path: '/convert',
      popular: true,
      count: animatedStats.totalConversions || 0
    },
    {
      name: 'Document Processor',
      description: 'PDF merge, split, convert and text extraction',
      icon: IoDocumentText,
      color: 'from-green-500 to-blue-500',
      path: '/documents',
      count: 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 content-with-navbar">
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full animate-float-elegant"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full animate-float-elegant delay-300"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-cyan-200/25 to-blue-200/25 rounded-full animate-float-elegant delay-600"></div>
      </div>

      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-20 animate-slide-up-fade">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-full border border-indigo-100 mb-8">
              <IoSparkles className="text-indigo-500 animate-bounce-gentle" />
              <span className="text-sm font-semibold gradient-text">CreativeForge AI Platform</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black mb-8 leading-tight text-display">
              <span className="gradient-text-flow">Creative</span>
              <br />
              <span className="text-gray-900">Dashboard</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed mb-12">
              Transform your creative vision into reality with CreativeForge's comprehensive suite of AI-powered tools
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/generate" className="btn-primary">
                <IoSparkles className="inline mr-2" />
                Start Creating
              </Link>
              <Link to="/convert" className="btn-secondary">
                <IoSwapHorizontal className="inline mr-2" />
                Convert Media
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              {
                label: 'Images Generated', 
                value: animatedStats.totalImages || 0, 
                icon: IoSparkles, 
                gradient: 'from-indigo-500 to-purple-500',
                bgGradient: 'from-indigo-50 to-purple-50'
              },
              { 
                label: 'Files Converted', 
                value: animatedStats.totalConversions || 0, 
                icon: IoVideocam, 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50'
              },
              { 
                label: 'Storage Used', 
                value: animatedStats.storageUsed || 0, 
                unit: 'MB',
                icon: IoServer, 
                gradient: 'from-green-500 to-teal-500',
                bgGradient: 'from-green-50 to-teal-50'
              },
              { 
                label: 'Total Projects', 
                value: animatedStats.totalProjects || 0, 
                icon: IoHeart, 
                gradient: 'from-pink-500 to-rose-500',
                bgGradient: 'from-pink-50 to-rose-50'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`card-modern hover-lift animate-slide-up-fade delay-${index * 75} bg-gradient-to-br ${stat.bgGradient}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white text-2xl" />
                  </div>
                </div>
                <div className="text-4xl font-black gradient-text mb-2">
                  {stat.value.toLocaleString()}{stat.unit || ''}
                </div>
                <p className="text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {tools.map((tool, index) => (
              <Link
                key={index}
                to={tool.path}
                className="group card-modern hover-lift animate-slide-up-fade"
                style={{animationDelay: `${index * 150}ms`}}
              >
                {tool.popular && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                    ⭐ Popular
                  </div>
                )}

                <div className={`w-20 h-20 bg-gradient-to-r ${tool.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <tool.icon className="text-white text-3xl" />
                </div>

                <h3 className="text-2xl font-black gradient-text mb-4">
                  {tool.name}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-body">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl">
                    <span className="text-sm font-semibold text-gray-600">
                      {tool.count} created
                    </span>
                  </div>
                  <div className="flex items-center text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-20px] group-hover:translate-x-0 transition-all duration-300">
                    <span className="mr-2">Launch</span>
                    <IoTrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="card-modern animate-slide-up-fade delay-600">
              <h3 className="text-3xl font-black gradient-text mb-8 flex items-center">
                <IoTime className="mr-4 text-indigo-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-6 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <IoSparkles className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {activity.prompt}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Panel */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="card-glass p-4 rounded-3xl shadow-elegant">
          <div className="flex space-x-3">
            {[
              { to: '/generate', icon: IoSparkles, gradient: 'from-indigo-500 to-purple-500' },
              { to: '/convert', icon: IoVideocam, gradient: 'from-blue-500 to-cyan-500' },
              { to: '/documents', icon: IoDocumentText, gradient: 'from-green-500 to-teal-500' }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center hover-scale shadow-lg`}
              >
                <action.icon className="text-white text-xl" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
