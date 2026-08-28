import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import API from '../../../lib/api';
import { C } from './aiTheme';

const QUICK = ['Analyze my students', 'Generate a quiz', 'Summarize a lecture', 'Find weak topics', 'Create revision material'];

export default function AIFloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([{ from: 'ai', text: 'Your intelligent classroom assistant' }]);

  const sendChatMessage = async text => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage) return;
    setChat(c => [...c, { from: 'user', text: trimmedMessage }]);
    setMessage('');
    try {
      const response = await axios.post(`${API}/chat`, { message: trimmedMessage }, { withCredentials: true });
      setChat(c => [...c, { from: 'ai', text: response.data.response }]);
    } catch (error) {
      setChat(c => [...c, { from: 'ai', text: "Sorry, I couldn't generate a response right now. Please try again." }]);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    sendChatMessage(message);
  };

  const quickAction = q => {
    if (q === 'Generate a quiz') {
      toast.info('Use "Generate AI Quiz" from the hero or a lecture card.');
      return;
    }
    sendChatMessage(q);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl animate-pulse-ring-ai"
        style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.violet})`, boxShadow: `0 16px 40px -10px ${C.primary}66` }}
        aria-label="CampusAI Assistant"
        data-testid="floating-ai-btn"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-3rem)] rounded-3xl overflow-hidden flex flex-col glass-card"
            style={{ border: '1px solid rgba(255,255,255,0.6)' }}
            data-testid="floating-ai-panel"
          >
            <div className="relative p-4 text-white flex items-center gap-3 overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.primary}, ${C.violet})` }}>
              <motion.div className="absolute inset-x-0 h-px bg-white/30" animate={{ top: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 5 }} />
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
              <div>
                <p className="font-semibold text-sm">CampusAI</p>
                <p className="text-xs text-blue-100 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse inline-block" /> Your intelligent classroom assistant</p>
              </div>
            </div>

            <div className="p-4 space-y-3 h-52 overflow-y-auto bg-slate-50/80">
              {chat.map((c, i) => (
                <div key={i} className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${c.from === 'ai' ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm' : 'text-white rounded-tr-sm ml-auto'}`} style={c.from === 'user' ? { background: C.primary } : {}}>
                  {c.text}
                </div>
              ))}
            </div>

            <div className="px-4 py-2 flex gap-2 flex-wrap bg-white">
              {QUICK.map(q => (
                <button key={q} onClick={() => quickAction(q)} className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors" style={{ backgroundColor: '#EEF4FF', color: C.primary }}>{q}</button>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <button className="p-2 rounded-xl text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors" aria-label="Mic"><Mic className="w-5 h-5" /></button>
              <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask CampusAI..." className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" data-testid="ai-chat-input" />
              <button onClick={sendMessage} className="p-2.5 rounded-xl text-white transition-colors" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.violet})` }} aria-label="Send" data-testid="ai-send-btn"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
