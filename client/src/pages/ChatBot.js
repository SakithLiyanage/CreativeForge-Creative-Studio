import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/api/ai/chat', { message: userMsg.text });
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: response.data.reply }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: 'Sorry, I could not respond.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 content-with-navbar flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 flex flex-col h-[70vh]">
        <h2 className="text-3xl font-black gradient-text mb-4 text-center">Chatbot</h2>
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-modern"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary px-6"
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot; 