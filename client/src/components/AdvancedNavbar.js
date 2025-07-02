import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IoHome, 
  IoSparkles, 
  IoSwapHorizontal, 
  IoDocumentText,
  IoQrCode,
  IoMenu,
  IoClose
} from 'react-icons/io5';
import LogoComponent from './LogoComponent';

const AdvancedNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-elegant border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <LogoComponent 
              size={48} 
              className="transform group-hover:rotate-12 transition-all duration-500" 
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black gradient-text-flow tracking-tight">
                CreativeForge
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">
                AI Creative Studio
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {[
              { path: '/', label: 'Dashboard', icon: IoHome },
              { path: '/generate', label: 'AI Studio', icon: IoSparkles },
              { path: '/convert', label: 'Media', icon: IoSwapHorizontal },
              { path: '/documents', label: 'Documents', icon: IoDocumentText },
              { path: '/qr', label: 'QR Codes', icon: IoQrCode }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <IconComponent className="text-lg" />
                    <span>{item.label}</span>
                  </span>
                  {isActive(item.path) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce-gentle"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? (
              <IoClose className="w-6 h-6 text-gray-700" />
            ) : (
              <IoMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden animate-slide-up-fade">
            <div className="p-4 space-y-2 bg-white rounded-2xl mt-2 border border-gray-100 shadow-elegant">
              {[
                { path: '/', label: 'Dashboard', icon: IoHome },
                { path: '/generate', label: 'AI Studio', icon: IoSparkles },
                { path: '/convert', label: 'Media', icon: IoSwapHorizontal },
                { path: '/documents', label: 'Documents', icon: IoDocumentText },
                { path: '/qr', label: 'QR Codes', icon: IoQrCode }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className="text-xl mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdvancedNavbar;


