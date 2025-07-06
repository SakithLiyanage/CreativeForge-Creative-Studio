import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdvancedNavbar from './components/AdvancedNavbar';
import Dashboard from './components/Dashboard';
import ImageGenerator from './pages/ImageGenerator';
import MediaConverter from './pages/MediaConverter';
import DocumentProcessor from './pages/DocumentProcessor';
import QRGenerator from './pages/QRGenerator';
import UrlShortener from './pages/UrlShortener';
import TempEmail from './pages/TempEmail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AdvancedNavbar />
        <main className="relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<ImageGenerator />} />
            <Route path="/convert" element={<MediaConverter />} />
            <Route path="/documents" element={<DocumentProcessor />} />
            <Route path="/qr" element={<QRGenerator />} />
            <Route path="/url-shortener" element={<UrlShortener />} />
            <Route path="/temp-email" element={<TempEmail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


