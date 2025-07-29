const express = require('express');

console.log('🧪 Testing route loading...');

// Test each route file
const routes = [
  'test',
  'images', 
  'videos',
  'convert',
  'analytics',
  'documents',
  'qr',
  'urlShortener',
  'tempEmail'
];

routes.forEach(route => {
  try {
    console.log(`🔄 Testing ${route} route...`);
    const router = require(`./routes/${route}`);
    console.log(`✅ ${route} route loaded successfully`);
  } catch (error) {
    console.error(`❌ ${route} route failed to load:`, error.message);
  }
});

console.log('✅ Route testing completed'); 