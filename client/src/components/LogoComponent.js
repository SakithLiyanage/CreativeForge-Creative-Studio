import React from 'react';

const LogoComponent = ({ size = 48, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle 
          cx="24" 
          cy="24" 
          r="22" 
          fill="url(#gradient1)"
          stroke="url(#gradient2)"
          strokeWidth="2"
        />
        
        {/* Creative Spark Icon */}
        <path 
          d="M24 8L26.5 18.5L37 16L28.5 24L37 32L26.5 29.5L24 40L21.5 29.5L11 32L19.5 24L11 16L21.5 18.5L24 8Z" 
          fill="white"
          opacity="0.9"
        />
        
        {/* Inner Glow */}
        <circle 
          cx="24" 
          cy="24" 
          r="8" 
          fill="url(#innerGlow)"
          opacity="0.6"
        />
        
        {/* Definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#f9a8d4" />
          </linearGradient>
          
          <radialGradient id="innerGlow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Animated Glow Effect */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          filter: 'blur(4px)'
        }}
      />
    </div>
  );
};

export default LogoComponent;
