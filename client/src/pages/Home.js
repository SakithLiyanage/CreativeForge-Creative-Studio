import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiSparkles, 
  HiSwitchHorizontal, 
  HiLightningBolt,
  HiPhotograph,
  HiUsers,
  HiShieldCheck,
  HiHeart,
  HiArrowRight,
  HiPlay
} from 'react-icons/hi';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden content-with-navbar">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-8 animate-fadeInUp">
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
              <span className="gradient-text">MediaWeb</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Experience the future of digital creativity with our advanced AI-powered platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link
                to="/generate"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden hover-lift"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <HiPlay className="text-xl" />
                  <span>Start Creating</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </Link>
              
              <Link
                to="/convert"
                className="group px-8 py-4 glass-card text-gray-800 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/30 hover-lift"
              >
                <span className="flex items-center justify-center space-x-2">
                  <HiLightningBolt className="text-xl text-yellow-500" />
                  <span>Convert Files</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
                  