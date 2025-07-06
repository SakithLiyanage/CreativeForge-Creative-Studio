import React, { useState } from 'react';
import { IoChatbubbles } from 'react-icons/io5';
import ChatBot from '../pages/ChatBot';

const ChatBotWidget = ({ position = 'right' }) => {
  const [open, setOpen] = useState(false);
  const cornerClass = position === 'left'
    ? 'left-6'
    : 'right-6';

  const modalJustifyClass = position === 'left'
    ? 'justify-start md:justify-start'
    : 'justify-end md:justify-end';

  const modalMarginStyle = position === 'left'
    ? { marginLeft: '2rem' }
    : { marginRight: '2rem' };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`fixed z-50 bottom-6 ${cornerClass} bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-300`}
        onClick={() => setOpen(true)}
        aria-label="Open AI Chatbot"
      >
        <IoChatbubbles className="text-2xl" />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className={`fixed inset-0 z-50 bg-black/40 flex items-end md:items-center ${modalJustifyClass}`}>
          <div className="w-full max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-0 md:mb-0 mb-0 animate-slide-up-fade flex flex-col h-[80vh]"
            style={modalMarginStyle}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg gradient-text">AI Chatbot</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setOpen(false)}
                aria-label="Close Chatbot"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatBot />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget; 