import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiSparkles, 
  HiSwitchHorizontal, 
  HiLightningBolt,
  HiPhotograph,
  HiUsers,
  HiClock,
  HiShieldCheck,
  HiHeart,
  HiArrowRight,
  HiPlay
} from 'react-icons/hi';
import ParticleBackground from '../components/ParticleBackground';
import ParallaxSection from '../components/ParallaxSection';

const AdvancedHome = () => {
  const [currentText, setCurrentText] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const heroTexts = [
    "Create Stunning AI Images",
    "Convert Media Seamlessly", 
    "Transform Your Vision",
    "Unleash Your Creativity"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroTexts.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 hero-section">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-8 scroll-reveal revealed">
            {/* Floating Elements with Parallax */}
            <ParallaxSection speed={-0.3} className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20 parallax-float" />
            <ParallaxSection speed={0.4} className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full opacity-20 parallax-float" />
            <ParallaxSection speed={-0.2} className="absolute top-1/2 right-20 w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 morphing-blob opacity-20" />
            
            <div 
              className="transform transition-transform duration-1000"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
                <span className="gradient-text">MediaWeb</span>
              </h1>
            </div>
            
            <div className="h-20 flex items-center justify-center">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-700 typing-effect flex items-center">
                <HiSparkles className="mr-3 text-purple-600" />
                {heroTexts[currentText]}
              </h2>
            </div>
            
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

      {/* Features Section */}
      <section className="relative py-32 px-4 content-with-navbar">
        <ParallaxSection speed={0.2}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 scroll-reveal">
              <h2 className="text-5xl font-bold gradient-text mb-6 flex items-center justify-center">
                <HiSparkles className="mr-4 text-purple-600" />
                Next-Level Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the power of advanced AI and seamless media processing
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: HiPhotograph, title: "AI Art Studio", description: "Generate breathtaking images with advanced AI capabilities", gradient: "from-purple-500 to-pink-500", delay: "0s" }, 
                { icon: HiSwitchHorizontal, title: "Smart Conversion", description: "Convert media files with intelligent optimization and quality preservation", gradient: "from-blue-500 to-teal-500", delay: "0.2s" }, 
                { icon: HiLightningBolt, title: "Lightning Fast", description: "Experience blazing-fast processing powered by cutting-edge technology", gradient: "from-yellow-500 to-red-500", delay: "0.4s" }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`group hover-lift glass-card p-8 rounded-3xl border border-white/20 scroll-reveal-left`}
                    style={{ animationDelay: feature.delay }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300">
                      <span className="mr-2">Learn More</span>
                      <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <ParallaxSection speed={-0.1}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 scroll-reveal">
              {[
                { number: "10K+", label: "Images Generated", icon: HiPhotograph, color: "text-purple-600" }, 
                { number: "5K+", label: "Files Converted", icon: HiSwitchHorizontal, color: "text-blue-600" }, 
                { number: "99.9%", label: "Uptime", icon: HiShieldCheck, color: "text-green-600" }, 
                { number: "24/7", label: "Support", icon: HiHeart, color: "text-red-600" }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="text-center group hover-lift glass-card p-6 rounded-2xl border border-white/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`text-4xl mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="mx-auto" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <ParallaxSection speed={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 rounded-3xl border border-white/20 animate-glowing scroll-reveal">
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6 flex items-center justify-center">
                <HiUsers className="mr-4" />
                Ready to Transform Your Ideas?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already using MediaWeb to bring their visions to life
              </p>
              <Link
                to="/generate"
                className="group inline-flex items-center px-12 py-4 btn-primary text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 hover-lift"
              >
                <HiSparkles className="mr-3 text-2xl group-hover:animate-spin" />
                Get Started Now
                <HiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </ParallaxSection>
      </section>
    </div>
  );
};

export default AdvancedHome;
