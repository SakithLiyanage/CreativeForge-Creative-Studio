import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  IoSparkles, 
  IoTrendingUp, 
  IoDocument, 
  IoQrCode, 
  IoMail,
  IoServer,
  IoHeart
} from 'react-icons/io5';
import axios from 'axios';
import ParallaxSection from './ParallaxSection';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalImages: 0,
    totalVideos: 0,
    totalConversions: 0,
    totalQRCodes: 0,
    totalShortUrls: 0,
    totalDocuments: 0
  });
  
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const tools = [
    {
      name: 'AI Image Generator',
      description: 'Create stunning images with AI technology',
      icon: IoSparkles,
      color: 'from-purple-500 to-pink-500',
      path: '/generate',
      popular: true,
      count: analytics.totalImages || 0
    },
    {
      name: 'Media Converter Pro',
      description: 'Convert images & videos with professional quality',
      icon: IoTrendingUp,
      color: 'from-blue-500 to-teal-500',
      path: '/convert',
      popular: true,
      count: analytics.totalConversions || 0
    },
    {
      name: 'Document Processor',
      description: 'PDF merge, split, convert and text extraction',
      icon: IoDocument,
      color: 'from-green-500 to-blue-500',
      path: '/documents',
      count: analytics.totalDocuments || 0
    },
    {
      name: 'QR Code Generator',
      description: 'Generate professional QR codes for any content',
      icon: IoQrCode,
      color: 'from-orange-500 to-red-500',
      path: '/qr',
      count: analytics.totalQRCodes || 0
    },
    {
      name: 'URL Shortener',
      description: 'Create short links with detailed analytics',
      icon: IoMail,
      color: 'from-indigo-500 to-purple-500',
      path: '/url-shortener',
      count: analytics.totalShortUrls || 0
    },
    {
      name: '10 Minute Email',
      description: 'Temporary email addresses for quick signups',
      icon: IoMail,
      color: 'from-pink-500 to-rose-500',
      path: '/temp-email',
      count: analytics.totalTempEmails || 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full animate-float-elegant blur-3xl"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-pink-200/15 to-rose-200/15 rounded-full animate-float-elegant delay-300 blur-2xl"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full animate-float-elegant delay-600 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-100/10 to-purple-100/10 rounded-full animate-pulse"></div>
      </div>

      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Enhanced Hero Section */}
          <div className="text-center mb-24 animate-slide-up-fade">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 rounded-full border border-indigo-100 mb-12 shadow-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <IoSparkles className="text-white animate-pulse" />
              </div>
              <span className="text-sm font-bold gradient-text">CreativeForge Platform</span>
              
            </div>
            
            <h1 className="text-8xl md:text-9xl font-black mb-8 leading-tight text-display tracking-tight">
              <span className="gradient-text-flow">Creative</span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-600 max-w-5xl mx-auto font-light leading-relaxed mb-16">
              Transform your creative vision into reality with our comprehensive suite of 
              <span className="gradient-text font-semibold"> creative tools</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link to="/generate" className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button className="relative btn-primary text-lg px-8 py-4">
                  <IoSparkles className="inline mr-3 text-xl" />
                  Start Creating
                </button>
              </Link>
              
              <Link to="/convert" className="group">
                <button className="btn-secondary text-lg px-8 py-4 group-hover:shadow-xl transition-all duration-300">
                  <IoTrendingUp className="inline mr-3 text-xl" />
                  Convert Media
                </button>
              </Link>
              
              <Link to="/documents" className="group">
                <button className="btn-secondary text-lg px-8 py-4 group-hover:shadow-xl transition-all duration-300">
                  <IoDocument className="inline mr-3 text-xl" />
                  Process Documents
                </button>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Grid with Visual Improvements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            {[
              {
                label: 'Images Generated', 
                value: analytics.totalImages || 0, 
                icon: IoSparkles, 
                gradient: 'from-indigo-500 to-purple-500',
                bgGradient: 'from-indigo-50 to-purple-50',
                trend: '+12%'
              },
              { 
                label: 'Files Converted', 
                value: analytics.totalConversions || 0, 
                icon: IoTrendingUp, 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                trend: '+8%'
              },
              { 
                label: 'Storage Used', 
                value: analytics.storageUsed || 0, 
                unit: 'MB',
                icon: IoServer, 
                gradient: 'from-green-500 to-teal-500',
                bgGradient: 'from-green-50 to-teal-50',
                trend: '+15%'
              },
              { 
                label: 'Total Projects', 
                value: analytics.totalProjects || 0, 
                icon: IoHeart, 
                gradient: 'from-pink-500 to-rose-500',
                bgGradient: 'from-pink-50 to-rose-50',
                trend: '+20%'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`group relative card-modern hover-lift animate-slide-up-fade delay-${index * 75} bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="text-white text-2xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl font-black gradient-text mb-2">
                    {stat.value.toLocaleString()}{stat.unit || ''}
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Tools Grid with Better Visual Hierarchy */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black gradient-text mb-4">Creative Tools</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional-grade tools powered by cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {tools.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.path}
                  className="group relative"
                  style={{animationDelay: `${index * 150}ms`}}
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-1000"></div>
                  
                  <div className="relative card-modern hover-lift animate-slide-up-fade bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                    {tool.popular && (
                      <div className="absolute -top-4 -right-4 z-10">
                        
                      </div>
                    )}

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                      <div className={`w-full h-full bg-gradient-to-br ${tool.color} rounded-full blur-2xl`}></div>
                    </div>

                    <div className="relative p-10">
                      <div className={`w-24 h-24 bg-gradient-to-r ${tool.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl`}>
                        <tool.icon className="text-white text-4xl" />
                      </div>

                      <h3 className="text-3xl font-black gradient-text mb-4 group-hover:gradient-text-flow transition-all duration-300">
                        {tool.name}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                        {tool.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-2xl border border-gray-200">
                          <span className="text-sm font-bold text-gray-700">
                            {tool.count} created
                          </span>
                        </div>
                        <div className="flex items-center text-indigo-600 font-black opacity-0 group-hover:opacity-100 transform translate-x-[-20px] group-hover:translate-x-0 transition-all duration-500">
                          <span className="mr-3 text-lg">Launch</span>
                          <IoTrendingUp className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Features Showcase Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black gradient-text mb-4">Why Choose CreativeForge?</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Experience the next generation of creative tools with advanced AI capabilities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                {
                  icon: IoSparkles,
                  title: 'AI-Powered',
                  description: 'Cutting-edge artificial intelligence drives every tool',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: IoTrendingUp,
                  title: 'Lightning Fast',
                  description: 'Optimized performance for instant results',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: IoServer,
                  title: 'Cloud Ready',
                  description: 'Seamless cloud integration and storage',
                  color: 'from-green-500 to-teal-500'
                },
                {
                  icon: IoHeart,
                  title: 'User Friendly',
                  description: 'Intuitive interface designed for creators',
                  color: 'from-pink-500 to-rose-500'
                }
              ].map((feature, index) => (
                <div key={index} className={`group text-center animate-slide-up-fade delay-${index * 100}`}>
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                    <feature.icon className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Action Panel */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/generate', icon: IoSparkles, gradient: 'from-indigo-500 to-purple-500', label: 'AI Studio' },
              { to: '/convert', icon: IoTrendingUp, gradient: 'from-blue-500 to-cyan-500', label: 'Convert' },
              { to: '/documents', icon: IoDocument, gradient: 'from-green-500 to-teal-500', label: 'Documents' },
              { to: '/qr', icon: IoQrCode, gradient: 'from-orange-500 to-red-500', label: 'QR Codes' },
              { to: '/url-shortener', icon: IoMail, gradient: 'from-indigo-500 to-purple-500', label: 'URL Short' },
              { to: '/temp-email', icon: IoMail, gradient: 'from-pink-500 to-rose-500', label: 'Temp Email' }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="group flex flex-col items-center space-y-2"
                title={action.label}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center hover-scale shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  <action.icon className="text-white text-lg" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

