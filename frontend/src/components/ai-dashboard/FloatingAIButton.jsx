import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, Send, Sparkles } from 'lucide-react';

const QUICK_PROMPTS = [
  'Summarize my last lecture',
  'Generate a practice quiz',
  'Create flashcards',
  'Explain today\u2019s topic in simple words',
];

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { from: 'ai', text: 'Hi! I\u2019m your AI assistant. How can I help you study today?' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChat((c) => [...c, { from: 'user', text: message }]);
    setMessage('');
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          from: 'ai',
          text: 'Got it! I\u2019ll work on that for you. (Demo assistant)',
        },
      ]);
    }, 800);
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-pulse-ring-ai"
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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">CampusAI Assistant</p>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
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
                      : 'bg-indigo-500 text-white rounded-tr-sm ml-auto'
                  }`}
                >
                  {c.text}
                </div>
              ))}
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 flex gap-2 flex-wrap bg-white">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setChat((c) => [...c, { from: 'user', text: q }]);
                    setTimeout(() => {
                      setChat((c) => [
                        ...c,
                        { from: 'ai', text: 'Great question! I\u2019m preparing a detailed response for you. (Demo)' },
                      ]);
                    }, 700);
                  }}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <button className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={sendMessage}
                className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
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
