import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import API from '../../lib/api';

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { from: 'ai', text: 'Hi! I’m your AI assistant. How can I help you study today?' },
  ]);

  useEffect(() => {
    const handleOpenChat = (e) => {
      setOpen(true);
      if (e.detail?.message) {
        setMessage(e.detail.message);
      }
    };
    window.addEventListener('open-campus-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-campus-ai-chat', handleOpenChat);
  }, []);

  const getQuickPrompts = () => {
    const path = window.location.pathname;
    if (path.includes('/lectures')) {
      return [
        'Explain this lecture\'s main concept',
        'Summarize this lecture section',
        'Create practice questions',
        'Give me a real-world example',
      ];
    }
    if (path.includes('/coding')) {
      return [
        'Explain Two Sum complexity',
        'Give me a code hint',
        'Find a bug in my solution',
        'How does a HashMap work?',
      ];
    }
    if (path.includes('/quizzes')) {
      return [
        'Explain recursion complexity',
        'What is OOP polymorphism?',
        'Give me a study guide',
        'How to improve quiz scores?',
      ];
    }
    return [
      'Create a study plan for me',
      'What are my weakest topics?',
      'Summarize my last lecture',
      'Explain inheritance simply',
    ];
  };

  const sendChatMessage = async (text) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage) return;
    setChat((c) => [...c, { from: 'user', text: trimmedMessage }]);
    setMessage('');
    try {
      const response = await axios.post(`${API}/chat`, { message: trimmedMessage }, { withCredentials: true });
      setChat((c) => [...c, { from: 'ai', text: response.data.response }]);
    } catch (error) {
      setChat((c) => [...c, { from: 'ai', text: "Sorry, I couldn't generate a response right now. Please try again." }]);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    sendChatMessage(message);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent-cyan text-white flex items-center justify-center shadow-2xl shadow-brand-primary/40 animate-pulse-ring-ai"
        aria-label="AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-accent-cyan p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">CampusAI Assistant</p>
                <p className="text-xs text-brand-accent-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Online · always learning
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 h-64 overflow-y-auto bg-gray-50">
              {chat.map((c, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    c.from === 'ai'
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                      : 'bg-brand-primary text-white rounded-tr-sm ml-auto'
                  }`}
                >
                  {c.text}
                </div>
              ))}
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 flex gap-2 flex-wrap bg-white">
              {getQuickPrompts().map((q) => (
                <button
                  key={q}
                  onClick={() => sendChatMessage(q)}
                  className="text-xs bg-brand-soft text-brand-primary hover:bg-brand-accent-light/30 px-3 py-1.5 rounded-full transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <button className="p-2 rounded-xl text-gray-400 hover:text-brand-primary hover:bg-brand-soft transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-light"
              />
              <button
                onClick={sendMessage}
                className="p-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
