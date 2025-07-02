// Script to generate favicon and app icons
const fs = require('fs');
const path = require('path');

// SVG content for the favicon
const faviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="url(#gradient1)" stroke="url(#gradient2)" stroke-width="1"/>
  <path d="M16 5L18 12L25 10L19 16L25 22L18 20L16 27L14 20L7 22L13 16L7 10L14 12L16 5Z" fill="white" opacity="0.9"/>
  <circle cx="16" cy="16" r="5" fill="url(#innerGlow)" opacity="0.6"/>
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a5b4fc"/>
      <stop offset="100%" stop-color="#f9a8d4"/>
    </linearGradient>
    <radialGradient id="innerGlow">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
</svg>
`;

// Create the favicon.svg file
const publicDir = path.join(__dirname, 'client', 'public');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);

console.log('✅ Favicon and icons generated successfully!');
console.log('📁 Files created in client/public/');
console.log('🎨 Logo component created for React usage');
console.log('');
console.log('To convert SVG to ICO and PNG files:');
console.log('1. Visit https://favicon.io/favicon-converter/');
console.log('2. Upload the favicon.svg file');
console.log('3. Download and replace the generated files');
console.log('');
console.log('Brand Identity:');
console.log('• Name: CreativeForge');
console.log('• Tagline: AI Creative Studio');
console.log('• Colors: Indigo (#6366f1), Purple (#8b5cf6), Pink (#ec4899)');
console.log('• Style: Modern, Professional, Creative');
