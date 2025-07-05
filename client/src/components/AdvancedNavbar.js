import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IoHome, 
  IoSparkles, 
  IoSwapHorizontal, 
  IoDocumentText,
  IoQrCode,
  IoLink,
  IoMail,
  IoMenu,
  IoClose
} from 'react-icons/io5';
import LogoComponent from './LogoComponent';

const AdvancedNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IoHome },
    { path: '/generate', label: 'AI Studio', icon: IoSparkles },
    { path: '/convert', label: 'Media', icon: IoSwapHorizontal },
    { path: '/documents', label: 'Documents', icon: IoDocumentText },
    { path: '/qr', label: 'QR Codes', icon: IoQrCode },
    { path: '/url-shortener', label: 'URL Short', icon: IoLink },
    { path: '/temp-email', label: 'Temp Email', icon: IoMail }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <IoSparkles className="text-white text-xl" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black gradient-text">CreativeForge</h1>
              <p className="text-xs text-gray-500 -mt-1">AI Creative Studio</p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-8">
            <div className="flex items-center space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                    }`}
                  >
                    <IconComponent className={`text-lg ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-500'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-80" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - CTA or User Menu */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-100">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-indigo-700">Online</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <IoClose className="w-6 h-6" />
              ) : (
                <IoMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className={`text-xl ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                    <div>
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdvancedNavbar;
         
