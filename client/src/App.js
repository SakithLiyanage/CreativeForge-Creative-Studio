import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AdvancedNavbar from './components/AdvancedNavbar';
import Dashboard from './components/Dashboard';
import ImageGenerator from './pages/ImageGenerator';
import MediaConverter from './pages/MediaConverter';
import DocumentProcessor from './pages/DocumentProcessor';
import QRGenerator from './pages/QRGenerator';
import UrlShortener from './pages/UrlShortener';
import TempEmail from './pages/TempEmail';
import ChatBot from './pages/ChatBot';
import ChatBotWidget from './components/ChatBotWidget';
import TestConnection from './pages/TestConnection';
import SimpleTest from './pages/SimpleTest';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  
  return (
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
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/simple-test" element={<SimpleTest />} />
        </Routes>
        <ChatBotWidget position={isDashboard ? "left" : "right"} />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


