import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import API from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function FloatingAIButton() {
  const { user } = useAuth();
  const currentRole = user?.role || 'student';
  const roleLabel = currentRole === 'teacher' ? 'Teacher' : 'Student';
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [currentLectureId, setCurrentLectureId] = useState(() => {
    const match = window.location.pathname.match(/^\/lectures\/([^/]+)/);
    return match ? match[1] : null;
  });
  const [recentTopic, setRecentTopic] = useState('');
  const [chat, setChat] = useState([
    {
      from: 'ai',
      text: currentRole === 'teacher'
        ? 'Hi! I’m your classroom AI assistant. How can I help your class today?'
        : 'Hi! I’m your AI assistant. How can I help you study today?',
    },
  ]);  const historyLoadedRef = useRef(false);
  useEffect(() => {
    const handleOpenChat = (e) => {
      setOpen(true);
      setCurrentLectureId(e.detail?.lectureId || null);
      if (e.detail?.message) {
        setMessage(e.detail.message);
      }
    };
    window.addEventListener('open-campus-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-campus-ai-chat', handleOpenChat);
  }, []);

  // Load persistent chat history when panel opens
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!open || historyLoadedRef.current) return;
      
      try {
        const response = await axios.get(`${API}/chat/history?limit=5`, { withCredentials: true });
        const history = response.data.history || [];
        
        if (history.length > 0) {
          // Convert history to chat format and prepend to current chat
          const formattedHistory = history.map((h) => ({
            from: h.role === 'assistant' ? 'ai' : 'user',
            text: h.content,
          }));
          
          // Extract recent topic from last AI response if available
          for (let i = formattedHistory.length - 1; i >= 0; i--) {
            if (formattedHistory[i].from === 'ai') {
              extractTopicFromAiReply(formattedHistory[i].text);
              break;
            }
          }
          
          // Only show history if it's not just the initial greeting
          if (formattedHistory.length > 0) {
            setChat((prevChat) => formattedHistory.concat(prevChat.slice(1))); // Keep initial greeting
          }
          historyLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    
    if (open) {
      loadChatHistory();
    }
  }, [open]);

  const getQuickPrompts = () => {
    if (currentRole === 'teacher') {
      return [
        'Analyze my class',
        'Which topics are difficult for my students?',
        'Students needing help',
        'Quiz analysis',
        'Create a revision plan',
      ];
    }

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
      'What are my weak topics?',
      'How am I performing?',
      'Create a study plan for me',
      'Explain my weakest topic',
    ];
  };

  const resolveFollowUpPrompt = (text) => {
    const trimmedMessage = text.trim();
    if (!recentTopic) return trimmedMessage;

    const lower = trimmedMessage.toLowerCase();
    const topic = recentTopic.trim();

    if (/^(explain|summarize|describe|tell me about|what is|why is)\s+(it|this|that|the topic)$/i.test(trimmedMessage)) {
      return `${trimmedMessage.replace(/\s+(it|this|that|the topic)$/i, '').trim() || 'Explain'} ${topic}`.trim();
    }

    if (/^(create a quiz on|give me a quiz on|quiz on|practice on)\s+(it|this|that|the topic)$/i.test(trimmedMessage)) {
      return `Create a quiz on ${topic}`;
    }

    if (/^(it|this|that|the topic)$/i.test(lower)) {
      return `Explain ${topic}`;
    }

    return trimmedMessage;
  };

  const extractTopicFromAiReply = (reply) => {
    if (!reply) return;
    const patterns = [
      /weakest topic is\s+([^,.]+)/i,
      /your weakest topic is\s+([^,.]+)/i,
      /the weakest topic is\s+([^,.]+)/i,
      /topic is\s+([^,.]+)/i,
      /most difficult topic\s+([^,.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = reply.match(pattern);
      if (match && match[1]) {
        const captured = match[1].trim();
        if (captured && !captured.toLowerCase().includes('not enough data')) {
          setRecentTopic(captured);
          return;
        }
      }
    }
  };

  const sendChatMessage = async (text) => {
    const resolvedMessage = resolveFollowUpPrompt(text);
    const trimmedMessage = resolvedMessage.trim();
    if (!trimmedMessage) return;
    setChat((c) => [...c, { from: 'user', text: trimmedMessage }]);
    setMessage('');
    try {
      const response = await axios.post(
        `${API}/chat`,
        { message: trimmedMessage, lecture_id: currentLectureId },
        { withCredentials: true },
      );
      const aiReply = response.data.response || 'I don\'t have enough data to answer that yet.';
      const intent = response.data.intent || '';
      
      extractTopicFromAiReply(aiReply);
      setChat((c) => [...c, { from: 'ai', text: aiReply }]);
      
      // Save to persistent history
      try {
        await axios.post(`${API}/chat/history/save`, 
          {
            message: trimmedMessage,
            response: aiReply,
            intent: intent,
          },
          { withCredentials: true }
        );
      } catch (saveError) {
        console.error('Failed to save chat history:', saveError);
        // Don't fail the chat if saving history fails
      }
    } catch (error) {
      const detail = error.response?.data?.detail || "Sorry, I couldn't generate a response right now. Please try again.";
      setChat((c) => [...c, { from: 'ai', text: detail }]);
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">CampusAI Assistant</p>
                  <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                    {roleLabel}
                  </span>
                </div>
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
