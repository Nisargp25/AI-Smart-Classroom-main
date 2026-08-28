import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AudioRecorder } from '../components/AudioRecorder';
import { toast } from 'sonner';
import CampusAiLogo from '../components/CampusAiLogo';
import { C } from '../components/ai-dashboard/teacher/aiTheme';
import NeuralBackground from '../components/ai-dashboard/teacher/NeuralBackground';
import NeuralHeroVisual from '../components/ai-dashboard/teacher/NeuralHeroVisual';
import LearningMap from '../components/ai-dashboard/teacher/LearningMap';
import SectionHeader from '../components/ai-dashboard/teacher/SectionHeader';
import AIRing from '../components/ai-dashboard/teacher/AIRing';
import AIFloatingAssistant from '../components/ai-dashboard/teacher/AIFloatingAssistant';
import {
  LayoutDashboard, BookOpen, FileQuestion, Trophy, Code2, Bell, LogOut, Sun, Moon,
  Plus, Sparkles, StickyNote, Bot, Users, Mic, Send, X, Loader2, CheckCircle2,
  ChevronRight, TrendingUp, Target, CalendarDays, Clock, BrainCircuit, Play, Radar,
  Network, Fingerprint, ScanLine, Activity, FileText, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lectures', href: '/lectures', icon: BookOpen },
  { label: 'Quizzes', href: '/quizzes', icon: FileQuestion },
  { label: 'Rankings', href: '/rankings', icon: Trophy },
  { label: 'Coding', href: '/coding', icon: Code2 },
];

const INTELLIGENCE_TREND = [
  { day: 'Mon', performance: 68, engagement: 72, quiz: 60 },
  { day: 'Tue', performance: 72, engagement: 76, quiz: 66 },
  { day: 'Wed', performance: 70, engagement: 80, quiz: 70 },
  { day: 'Thu', performance: 78, engagement: 84, quiz: 76 },
  { day: 'Fri', performance: 82, engagement: 88, quiz: 82 },
  { day: 'Sat', performance: 85, engagement: 90, quiz: 86 },
  { day: 'Sun', performance: 88, engagement: 91, quiz: 90 },
];

const INSIGHTS = [
  { tag: 'PERFORMANCE ALERT', title: 'OOP performance is declining', body: '68% of students scored below 70%.', rec: 'AI recommends a revision quiz.', action: 'Generate Quiz', grad: 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(56,189,248,0.06))', glow: C.warm, icon: AlertTriangle },
  { tag: 'POSITIVE TREND', title: 'Engagement increased 18%', body: 'Great momentum this week.', rec: 'AI confidence: 94%', action: 'View Analytics', grad: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(6,182,212,0.06))', glow: C.green, icon: TrendingUp },
  { tag: 'REVISION NEEDED', title: 'Data Structures needs attention', body: 'Quiz completion dropped to 69%.', rec: 'AI recommends a short practice set.', action: 'Create Notes', grad: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(56,189,248,0.06))', glow: C.violet, icon: BrainCircuit },
];

const TOP_PERFORMERS = [
  { name: 'Sarah', score: 95, initials: 'SA', color: C.warm },
  { name: 'Alex', score: 91, initials: 'AL', color: C.electric },
  { name: 'John', score: 88, initials: 'JO', color: C.green },
];

const NEEDS_ATTENTION = [
  { name: 'Student A', score: 52, note: 'AI: additional practice recommended' },
  { name: 'Student B', score: 58, note: 'AI: additional practice recommended' },
];

const AI_TASKS = [
  { group: 'Today', items: [{ label: 'OOP Revision Quiz', ai: true, time: '2:00 PM', color: C.primary }, { label: 'Data Structures Lecture', ai: false, time: '4:00 PM', color: C.cyan }] },
  { group: 'Tomorrow', items: [{ label: 'Assignment Review', ai: true, time: '9:00 AM', color: C.violet }] },
];

const QUICK_ACTIONS = [
  { title: 'Create Lecture', desc: 'Record & let AI process content', icon: Plus, color: C.primary },
  { title: 'Generate AI Quiz', desc: 'Instant quiz from any lecture', icon: BrainCircuit, color: C.violet },
  { title: 'Generate Notes', desc: 'AI summaries of any lecture', icon: StickyNote, color: C.cyan },
  { title: 'Ask AI', desc: 'Analyze your classroom', icon: Bot, color: C.warm },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } }) };
const cardCls = 'rounded-[24px] bg-white/70 backdrop-blur border border-white/70 shadow-soft p-6';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    subject: '',
    topic: '',
    batch: 'All',
    class_name: user?.class_name || '',
    division: user?.division || '',
  });
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [numOptions, setNumOptions] = useState(4);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { fetchTeacherData(); }, []);

  const fetchTeacherData = async () => {
    try {
      const [lectRes, quizRes] = await Promise.all([
        axios.get(`${API}/lectures`, { withCredentials: true }),
        axios.get(`${API}/quizzes`, { withCredentials: true }),
      ]);
      setLectures(lectRes.data);
      setQuizzes(quizRes.data);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const createLecture = async () => {
    if (!newLecture.title || !newLecture.subject || !newLecture.topic) { toast.error('Please fill all required fields'); return; }
    setCreating(true);
    try {
      const response = await axios.post(`${API}/lectures`, newLecture, { withCredentials: true });
      setSelectedLecture(response.data);
      setNewLecture({ title: '', subject: '', topic: '', batch: 'All', class_name: user?.class_name || '', division: user?.division || '' });
      toast.success('Lecture created! You can now record audio.');
    } catch (error) { console.error('Error creating lecture:', error); toast.error('Failed to create lecture'); }
    finally { setCreating(false); }
  };

  const handleRecordingComplete = async (audioBlob) => {
    if (!selectedLecture) { toast.error('Please create a lecture first'); return; }
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    try {
      await axios.post(`${API}/lectures/${selectedLecture.lecture_id}/audio`, formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Audio uploaded! Processing...');
      const processRes = await axios.post(`${API}/lectures/${selectedLecture.lecture_id}/process`, {}, { withCredentials: true });
      setSelectedLecture(processRes.data);
      fetchTeacherData();
      toast.success('Lecture processed successfully!');
    } catch (error) { console.error('Error processing lecture:', error); toast.error('Failed to process lecture'); }
  };

  const generateQuizFromLecture = async (lectureId) => {
    setGeneratingQuiz(true);
    try {
      const lecture = lectures.find(l => l.lecture_id === lectureId);
      const response = await axios.post(`${API}/quizzes/generate`, { lecture_id: lectureId, topic: lecture?.topic || 'General', num_questions: numQuestions, num_options: numOptions }, { withCredentials: true });
      setGeneratedQuestions(response.data.questions);
      toast.success('Quiz questions generated!');
    } catch (error) { console.error('Error generating quiz:', error); toast.error('Failed to generate quiz'); }
    finally { setGeneratingQuiz(false); }
  };

  const updateGeneratedQuestion = (index, field, value) => setGeneratedQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  const updateOption = (qIndex, optIndex, value) => setGeneratedQuestions(prev => prev.map((q, i) => { if (i !== qIndex) return q; const options = [...q.options]; options[optIndex] = value; return { ...q, options }; }));
  const deleteGeneratedQuestion = index => { setGeneratedQuestions(prev => prev.filter((_, i) => i !== index)); toast.success('Question removed'); };

  const saveQuiz = async () => {
    if (!selectedLecture || generatedQuestions.length === 0) { toast.error('No questions to save'); return; }
    try {
      await axios.post(`${API}/quizzes`, { lecture_id: selectedLecture.lecture_id, title: `Quiz: ${selectedLecture.title}`, subject: selectedLecture.subject, topic: selectedLecture.topic, questions: generatedQuestions, time_limit: 15 }, { withCredentials: true });
      toast.success('Quiz saved successfully!');
      setShowQuizDialog(false);
      setGeneratedQuestions([]);
      fetchTeacherData();
    } catch (error) { console.error('Error saving quiz:', error); toast.error('Failed to save quiz'); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };
  const firstName = user?.name?.split(' ')[0] || 'Teacher';

  const lectureCards = lectures.length ? lectures.slice(0, 6).map((lec, i) => ({
    id: lec.lecture_id, title: lec.title, subject: lec.subject || 'Computer Science',
    students: [45, 42, 38, 50, 40, 36][i % 6], understanding: [82, 78, 76, 88, 80, 74][i % 6],
    quizPerf: [76, 69, 65, 82, 72, 68][i % 6], confidence: [91, 87, 84, 94, 88, 80][i % 6],
    rec: ['Students need additional practice with polymorphism.', 'AI recommends a quick revision set on recursion.', 'Review graph traversal concepts next session.', 'Great progress — extend with real-world cases.', 'Focus on sorting algorithm time complexity.', 'AI suggests a practice quiz on hashing.'][i % 6],
    emoji: ['📚', '🧠', '🤖', '⚡', '🖥️', '🔬'][i % 6],
    grad: ['linear-gradient(135deg,#2563EB,#38BDF8)', 'linear-gradient(135deg,#8B5CF6,#38BDF8)', 'linear-gradient(135deg,#06B6D4,#2563EB)', 'linear-gradient(135deg,#22C55E,#06B6D4)', 'linear-gradient(135deg,#F59E0B,#38BDF8)', 'linear-gradient(135deg,#2563EB,#8B5CF6)'][i % 6],
  })) : [];

  const openQuizForLecture = lec => { setSelectedLecture(lec); setGeneratedQuestions([]); setShowQuizDialog(true); };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.bg }}>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border-4 border-t-transparent animate-spin" style={{ borderColor: `${C.primary}33`, borderTopColor: C.primary }} />
            <p className="text-sm font-medium text-slate-500">CampusAI is analyzing your classroom...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: C.bg, color: C.text }} data-testid="teacher-dashboard">
      <NeuralBackground />

      {/* NAVBAR */}
      <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="sticky top-4 z-50 mx-auto max-w-[1500px] px-4 sm:px-6">
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_12px_40px_-16px_rgba(37,99,235,0.18)]">
          <div className="flex items-center justify-between h-16 px-4">
            <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0" data-testid="nav-logo">
              <CampusAiLogo className="w-9 h-9 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:block">
                <span className="font-display font-bold text-[#102A43] leading-none block">CampusAI</span>
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: C.primary }}>INTELLIGENCE</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 rounded-full p-1.5 border border-slate-200/60">
              {NAV_ITEMS.map(item => {
                const active = item.href === '/dashboard';
                return (
                  <Link key={item.label} to={item.href} className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${active ? 'text-white' : 'text-slate-500 hover:text-[#102A43]'}`}>
                    {active && <motion.span layoutId="teacher-nav-pill" className="absolute inset-0 rounded-full shadow-md" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.electric})` }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                    <item.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-[#102A43]">
                <AIRing /> AI Online
              </span>
              <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors" aria-label="Toggle theme" data-testid="theme-toggle">{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button className="relative p-2 rounded-full text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors" aria-label="Notifications" data-testid="notifications-btn"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: C.warm }} /></button>
              <Link to="/settings" className="hidden md:flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white/80 border border-slate-200 hover:bg-slate-50 transition-colors" data-testid="profile-avatar">
                <Avatar className="w-8 h-8"><AvatarFallback className="text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.violet})` }}>{user?.name?.charAt(0)?.toUpperCase() || 'T'}</AvatarFallback></Avatar>
                <div className="text-left leading-tight hidden sm:block"><p className="text-sm font-medium text-[#102A43]">{user?.name?.split(' ')[0] || 'Teacher'}</p><p className="text-[10px] text-slate-400">Teacher</p></div>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors" aria-label="Log out" data-testid="logout-btn"><LogOut className="w-5 h-5" /></button>
              <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100" aria-label="Menu" data-testid="mobile-menu-btn"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            </div>
          </div>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden px-4 pb-4 overflow-hidden">
                <nav className="grid grid-cols-2 gap-2">
                  {NAV_ITEMS.map(item => (
                    <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item.href === '/dashboard' ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}`} style={item.href === '/dashboard' ? { background: C.primary } : {}}>
                      <item.icon className="w-4 h-4" />{item.label}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <main className="relative max-w-[1500px] mx-auto px-4 sm:px-6 py-8">
        {/* HERO */}
        <motion.section variants={fadeUp} initial="hidden" animate="show" className="relative overflow-hidden rounded-[28px] p-6 sm:p-10 mb-8 glass-card">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(37,99,235,0.05), rgba(56,189,248,0.06), rgba(139,92,246,0.04))' }} />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 65%)' }} />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/80 border border-blue-100 text-[#2563EB]"><Sparkles className="w-3 h-3 animate-twinkle" /> AI Classroom</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/80 border border-purple-100 text-[#8B5CF6]"><ScanLine className="w-3 h-3" /> Analyzing</span>
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[42px] leading-tight text-[#102A43]">Good morning, {firstName} 👋</h1>
              <p className="text-slate-600 mt-3 max-w-xl leading-relaxed">
                Your classroom is being analyzed by CampusAI. AI scanned <span className="font-semibold" style={{ color: C.primary }}>45 students</span>,{' '}
                <span className="font-semibold" style={{ color: C.violet }}>{lectures.length || 11} lectures</span> and{' '}
                <span className="font-semibold" style={{ color: C.cyan }}>{quizzes.length || 5} quizzes</span> this week.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Button onClick={() => setShowRecordDialog(true)} className="rounded-full shadow-lg text-white h-11 px-6" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.electric})`, boxShadow: `0 12px 30px -10px ${C.primary}66` }} data-testid="new-lecture-btn"><Plus className="w-4 h-4 mr-2" /> New Lecture</Button>
                <Button variant="outline" className="rounded-full h-11 px-6 border-slate-200 bg-white/70 text-[#102A43] hover:bg-white" onClick={() => { if (lectures.length) openQuizForLecture(lectures[0]); else toast.info('Create a lecture first to generate a quiz'); }} data-testid="hero-generate-quiz"><Sparkles className="w-4 h-4 mr-2" style={{ color: C.violet }} /> Generate AI Quiz</Button>
                <Button variant="ghost" className="rounded-full h-11 px-6 text-[#102A43] hover:bg-blue-50" data-testid="hero-ask-ai"><Bot className="w-4 h-4 mr-2" style={{ color: C.warm }} /> Ask CampusAI</Button>
              </div>
            </div>
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="relative rounded-[24px] border border-white/70 bg-white/60 backdrop-blur-xl p-3 shadow-xl"><NeuralHeroVisual /></div>
            </div>
          </div>
        </motion.section>

        {/* QUICK ACTIONS */}
        <motion.section variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button key={action.title} custom={i} variants={fadeUp} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }} onClick={() => { if (action.title === 'Create Lecture') setShowRecordDialog(true); else if (action.title === 'Generate AI Quiz') { if (lectures.length) openQuizForLecture(lectures[0]); else toast.info('Create a lecture first'); } else toast.info('CampusAI assistant coming up!'); }} className="group text-left rounded-[22px] bg-white/70 backdrop-blur border border-white/70 shadow-soft p-5 transition-all" data-testid={`quick-action-${i}`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform relative" style={{ background: `linear-gradient(135deg, ${action.color}, ${C.electric})`, boxShadow: `0 10px 24px -8px ${action.color}66` }}><action.icon className="w-6 h-6" /><span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: '#fff', boxShadow: '0 0 6px #fff' }} /></div>
              <h3 className="font-display font-semibold text-[#102A43] leading-tight">{action.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
            </motion.button>
          ))}
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6 min-w-0">
            {/* AI STATUS CARD */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="relative overflow-hidden rounded-[26px] p-6 sm:p-8 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 55%, #8B5CF6 100%)', boxShadow: '0 24px 60px -20px rgba(37,99,235,0.5)' }}>
              <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-cyan-200/10 rounded-full blur-3xl" />
              <motion.div className="absolute inset-x-0 h-px bg-white/30" animate={{ top: ['10%', '90%', '10%'] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center"><Fingerprint className="w-6 h-6 animate-twinkle" /></div>
                    <div>
                      <h2 className="font-display font-bold text-xl leading-none tracking-wide">✦ CAMPUSAI INTELLIGENCE</h2>
                      <p className="text-xs text-blue-100 mt-1.5 flex items-center gap-1.5"><AIRing color={C.green} /> AI is analyzing your classroom</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  {[{ label: 'Students analyzed', value: '45', color: '#fff' }, { label: 'Lectures analyzed', value: `${lectures.length || 11}`, color: '#BEF264' }, { label: 'Quizzes analyzed', value: `${quizzes.length || 5}`, color: '#67E8F9' }].map(stat => (
                    <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15"><p className="font-display font-bold text-3xl" style={{ color: stat.color }}>{stat.value}</p><p className="text-[11px] text-blue-100 mt-1">{stat.label}</p></div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-blue-50 flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: C.warm }} /> AI found <span className="font-bold">3 recommendations</span> for you</p>
                  <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-full transition-colors" onClick={() => { const el = document.getElementById('ai-insights'); el?.scrollIntoView({ behavior: 'smooth' }); }} data-testid="view-ai-insights">View AI Insights <ArrowUpRight className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.section>

            {/* AI INSIGHTS */}
            <motion.section id="ai-insights" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={Sparkles} title="✦ AI Classroom Intelligence" subtitle="CampusAI analyzed your classroom and found these patterns." accent={C.violet} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INSIGHTS.map((insight, i) => (
                  <motion.div key={insight.tag} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -4, scale: 1.02 }} className="rounded-[20px] p-5 border border-slate-100 flex flex-col" style={{ background: insight.grad }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500">✦ {insight.tag}</span>
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${insight.glow}, ${C.electric})`, boxShadow: `0 6px 16px -6px ${insight.glow}` }}><insight.icon className="w-4 h-4 text-white" /></span>
                    </div>
                    <h3 className="font-display font-semibold text-[#102A43] leading-snug mb-2">{insight.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{insight.body}</p>
                    <p className="text-[11px] font-medium text-slate-600 mb-4 flex items-center gap-1.5 flex-1"><Sparkles className="w-3 h-3" style={{ color: insight.glow }} /> {insight.rec}</p>
                    <button className="inline-flex items-center gap-1 self-start text-xs font-semibold text-white px-3 py-2 rounded-full transition-transform hover:scale-105" style={{ background: `linear-gradient(90deg, ${insight.glow}, ${C.primary})` }} onClick={() => { if (insight.action === 'Generate Quiz' && lectures.length) openQuizForLecture(lectures[0]); else if (insight.action === 'View Analytics') navigate('/dash/analytics'); else toast.info(insight.action); }} data-testid={`insight-action-${i}`}>{insight.action} <ArrowUpRight className="w-3.5 h-3.5" /></button>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* AI LEARNING ANALYTICS */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={Radar} title="AI Learning Analytics" subtitle="AI-generated classroom intelligence" accent={C.cyan} action={<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full"><TrendingUp className="w-3 h-3" /> +18% this week</span>} />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={INTELLIGENCE_TREND} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={({ active, payload, label }) => { if (!active || !payload?.length) return null; return (<div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-xl text-xs"><p className="font-semibold text-[#102A43] mb-1">{label}</p>{payload.map(p => (<p key={p.dataKey} className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />{p.name}: {p.value}%</p>))}<p className="text-slate-400 mt-1.5 italic">Performance increased after the OOP revision lecture.</p></div>); }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                    <Line type="monotone" dataKey="performance" name="Performance" stroke={C.primary} strokeWidth={2.5} dot={{ r: 4, fill: C.primary, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="engagement" name="Engagement" stroke={C.violet} strokeWidth={2.5} dot={{ r: 4, fill: C.violet, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="quiz" name="Quiz completion" stroke={C.cyan} strokeWidth={2.5} dot={{ r: 4, fill: C.cyan, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* AI LEARNING MAP */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={Network} title="AI Learning Map" subtitle="Knowledge graph of your classroom" accent={C.violet} />
              <LearningMap />
            </motion.section>

            {/* LECTURE INTELLIGENCE */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={BrainCircuit} title="Lecture Intelligence" subtitle="AI-analyzed lecture understanding" accent={C.primary} action={<Button variant="ghost" size="sm" className="rounded-full text-[#2563EB] hover:bg-blue-50" onClick={() => navigate('/lectures')} data-testid="view-all-lectures">All lectures <ChevronRight className="w-4 h-4 ml-1" /></Button>} />
              {lectureCards.length === 0 ? (
                <div className="text-center py-8 text-slate-500"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" /><p>No lectures yet. Create your first lecture!</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {lectureCards.map((lec, i) => (
                    <motion.div key={lec.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -6, scale: 1.01 }} className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 shadow-soft hover:shadow-soft-lg transition-all" data-testid={`lecture-card-${i}`}>
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: lec.grad }} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: lec.grad }}>{lec.emoji}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{lec.subject}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full"><ScanLine className="w-2.5 h-2.5" /> AI analyzed</span>
                          </div>
                        </div>
                        <h3 className="font-display font-semibold text-[#102A43] leading-snug mb-4 uppercase tracking-wide">{lec.title}</h3>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100"><Users className="w-4 h-4 mb-1" style={{ color: C.primary }} /><span className="text-sm font-bold text-[#102A43]">{lec.students}</span><span className="text-[10px] text-slate-400">Students</span></div>
                          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100"><Target className="w-4 h-4 mb-1" style={{ color: C.violet }} /><span className="text-sm font-bold text-[#102A43]">{lec.understanding}%</span><span className="text-[10px] text-slate-400">Understanding</span></div>
                          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100"><FileQuestion className="w-4 h-4 mb-1" style={{ color: C.cyan }} /><span className="text-sm font-bold text-[#102A43]">{lec.quizPerf}%</span><span className="text-[10px] text-slate-400">Quiz perf</span></div>
                        </div>
                        <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-500 flex items-center gap-1"><Sparkles className="w-3 h-3" style={{ color: C.violet }} /> AI confidence</span><span className="font-semibold text-[#102A43]">{lec.confidence}%</span></div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} whileInView={{ width: `${lec.confidence}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full" style={{ background: lec.grad }} /></div>
                        <div className="mb-4 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60"><p className="text-[11px] text-slate-500 flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.warm }} /><span><span className="font-semibold text-slate-600">AI recommendation:</span> {lec.rec}</span></p></div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/lectures/${lec.id}`)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.electric})` }} data-testid={`lecture-view-${i}`}><Play className="w-3.5 h-3.5" /> View Lecture</button>
                          <button onClick={() => openQuizForLecture(lec)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors" style={{ backgroundColor: '#EEF4FF', color: C.primary }} data-testid={`lecture-quiz-${i}`}><Bot className="w-3.5 h-3.5" /> Ask AI</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* RIGHT RAIL */}
          <div className="xl:col-span-4 space-y-6 min-w-0">
            {/* STUDENT INTELLIGENCE */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={Users} title="Student Intelligence" subtitle="AI-ranked classroom insights" accent={C.warm} action={<button className="text-sm font-semibold text-[#2563EB] hover:text-[#1e40af] flex items-center gap-1" onClick={() => navigate('/rankings')} data-testid="view-all-students">View All <ChevronRight className="w-4 h-4" /></button>} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Top performers</p>
              <div className="space-y-3 mb-5">
                {TOP_PERFORMERS.map((student, i) => (
                  <motion.div key={student.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-colors" data-testid={`top-student-${i}`}>
                    <div className="relative shrink-0"><Avatar className="w-10 h-10"><AvatarFallback className="text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${student.color}, ${C.electric})` }}>{student.initials}</AvatarFallback></Avatar><span className="absolute -top-1 -right-1 text-sm">{['🥇', '🥈', '🥉'][i]}</span></div>
                    <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="font-medium text-[#102A43] text-sm truncate">{student.name}</span><span className="text-sm font-bold" style={{ color: student.color }}>{student.score}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: `${student.score}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${student.color}, ${C.electric})` }} /></div></div>
                  </motion.div>
                ))}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Needs attention</p>
              <div className="space-y-3">
                {NEEDS_ATTENTION.map((student, i) => (
                  <motion.div key={student.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40" data-testid={`attention-student-${i}`}>
                    <Avatar className="w-10 h-10"><AvatarFallback className="text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${C.warm}, ${C.violet})` }}>{student.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="font-medium text-[#102A43] text-sm truncate">{student.name}</span><span className="text-sm font-bold" style={{ color: C.warm }}>{student.score}%</span></div><p className="text-[10px] text-slate-500 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" style={{ color: C.warm }} /> {student.note}</p></div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* UPCOMING AI TASKS */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={CalendarDays} title="Upcoming AI Tasks" subtitle="AI-prioritized schedule" accent={C.cyan} />
              <div className="space-y-4">
                {AI_TASKS.map((group, gi) => (
                  <div key={group.group}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{group.group}</p>
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <motion.div key={item.label} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: gi * 0.1 }} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-colors" data-testid={`upcoming-${group.group}-${item.label}`}>
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: `linear-gradient(135deg, ${item.color}, ${C.electric})` }}>{item.ai ? <Sparkles className="w-4 h-4" /> : <FileText className="w-4 h-4" />}</span>
                          <div className="flex-1 min-w-0"><p className="font-medium text-[#102A43] text-sm truncate">{item.label}</p><p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</p></div>
                          {item.ai && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#8B5CF6] bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wide"><Sparkles className="w-2 h-2" /> AI generated</span>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* RECENT LECTURES */}
            <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className={cardCls}>
              <SectionHeader icon={FileText} title="Recent Lectures" subtitle="AI-processed history" accent={C.green} />
              <div className="space-y-1">
                {[{ label: 'Object Oriented Programming', when: 'Today', status: 'Processed' }, { label: 'Data Structures', when: 'Yesterday', status: 'Processed' }, { label: 'AI Automation', when: 'Aug 5', status: 'Processed' }].map((lec, i) => (
                  <motion.div key={lec.label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0" data-testid={`recent-lecture-${i}`}>
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.15))' }}><CheckCircle2 className="w-4 h-4" style={{ color: C.green }} /></span>
                    <div className="flex-1 min-w-0"><p className="font-medium text-[#102A43] text-sm truncate">{lec.label}</p><p className="text-xs text-slate-400">{lec.when}</p></div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100"><ScanLine className="w-2.5 h-2.5" /> {lec.status}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <AIFloatingAssistant />

      {/* CREATE / RECORD DIALOG */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogTrigger asChild><span className="hidden" /></DialogTrigger>
        <DialogContent className="max-w-2xl" data-testid="record-dialog">
          <DialogHeader><DialogTitle className="font-display text-[#102A43]">Create & Record Lecture</DialogTitle></DialogHeader>
          <div className="space-y-6">
            {!selectedLecture ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="title">Lecture Title</Label><Input id="title" placeholder="e.g., Introduction to Arrays" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} data-testid="lecture-title-input" /></div>
                  <div><Label htmlFor="subject">Subject</Label><Input id="subject" placeholder="e.g., Computer Science" value={newLecture.subject} onChange={e => setNewLecture({ ...newLecture, subject: e.target.value })} data-testid="lecture-subject-input" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="topic">Topic</Label><Input id="topic" placeholder="e.g., Data Structures" value={newLecture.topic} onChange={e => setNewLecture({ ...newLecture, topic: e.target.value })} data-testid="lecture-topic-input" /></div>
                  <div><Label htmlFor="batch">Batch</Label><Select value={newLecture.batch} onValueChange={val => setNewLecture({ ...newLecture, batch: val })}><SelectTrigger data-testid="lecture-batch-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Students</SelectItem><SelectItem value="CS-2025">CS-2025</SelectItem><SelectItem value="CS-2024">CS-2024</SelectItem></SelectContent></Select></div>
                </div>

                {/* Class & Division assignment — critical for lecture isolation */}
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Class &amp; Division Assignment
                  </p>
                  <p className="text-xs text-slate-500">Only students in the selected class and division will see this lecture.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class_name">Class Name</Label>
                      <Input
                        id="class_name"
                        placeholder="e.g., B.Tech IT"
                        value={newLecture.class_name}
                        onChange={e => setNewLecture({ ...newLecture, class_name: e.target.value })}
                        data-testid="lecture-class-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="division">Division</Label>
                      <Input
                        id="division"
                        placeholder="e.g., A"
                        value={newLecture.division}
                        onChange={e => setNewLecture({ ...newLecture, division: e.target.value })}
                        data-testid="lecture-division-input"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Tip: Leave blank or type "All" to make this lecture visible to all divisions.
                  </p>
                </div>

                <Button onClick={createLecture} disabled={creating} className="w-full rounded-xl" style={{ background: C.primary }} data-testid="create-lecture-btn">{creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Create Lecture</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100"><h4 className="font-medium text-[#102A43]">{selectedLecture.title}</h4><p className="text-sm text-slate-500">{selectedLecture.subject} • {selectedLecture.topic}</p><Badge className="mt-2" style={{ background: C.secondary }}>{selectedLecture.status}</Badge></div>
                {selectedLecture.status === 'pending' && <AudioRecorder onRecordingComplete={handleRecordingComplete} />}
                {selectedLecture.status === 'completed' && (<div className="space-y-4"><div className="p-4 rounded-xl bg-green-50 flex items-center gap-2 border border-green-100"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-green-700">Lecture processed successfully!</span></div><Button onClick={() => navigate(`/lectures/${selectedLecture.lecture_id}`)} variant="outline" className="w-full rounded-xl">View Lecture Notes</Button></div>)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QUIZ GENERATION DIALOG */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="quiz-dialog">
          <DialogHeader><DialogTitle className="font-display text-[#102A43]">AI Generated Quiz</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><Label htmlFor="num-questions">Number of Questions</Label><Select value={numQuestions.toString()} onValueChange={val => setNumQuestions(parseInt(val))}><SelectTrigger id="num-questions" data-testid="num-questions-select"><SelectValue /></SelectTrigger><SelectContent>{[5, 10, 15, 20, 30, 40, 50].map(n => (<SelectItem key={n} value={n.toString()}>{n} questions</SelectItem>))}</SelectContent></Select></div>
            <div><Label htmlFor="num-options">Options per Question</Label><Select value={numOptions.toString()} onValueChange={val => setNumOptions(parseInt(val))}><SelectTrigger id="num-options" data-testid="num-options-select"><SelectValue /></SelectTrigger><SelectContent>{[2, 3, 4, 5].map(n => (<SelectItem key={n} value={n.toString()}>{n} options</SelectItem>))}</SelectContent></Select></div>
          </div>
          {generatingQuiz ? (
            <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: C.primary }} /><p className="text-slate-500">Generating quiz questions...</p></div>
          ) : (
            <>
              {generatedQuestions.length === 0 && (<div className="mb-4"><Button onClick={() => { if (selectedLecture) generateQuizFromLecture(selectedLecture.lecture_id); }} className="w-full rounded-xl" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.violet})` }} disabled={!selectedLecture} data-testid="generate-questions-btn"><Sparkles className="w-4 h-4 mr-2" /> Generate Questions with AI</Button></div>)}
              <div className="space-y-4">
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-4 border rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-2"><Input value={q.question} onChange={e => updateGeneratedQuestion(i, 'question', e.target.value)} className="font-medium" placeholder={`Q${i + 1}. Question text`} data-testid={`edit-question-${i}`} /><Button variant="ghost" size="sm" onClick={() => deleteGeneratedQuestion(i)} className="text-red-500 flex-shrink-0"><X className="w-4 h-4" /></Button></div>
                    <div className="space-y-1">
                      {q.options.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <button type="button" onClick={() => updateGeneratedQuestion(i, 'correct_answer', j)} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${j === q.correct_answer ? 'bg-green-500 text-white border-green-500' : 'border-slate-300 text-slate-500'}`} title={j === q.correct_answer ? 'Correct answer' : 'Mark as correct'} data-testid={`mark-correct-${i}-${j}`}>{String.fromCharCode(65 + j)}</button>
                          <Input value={opt} onChange={e => updateOption(i, j, e.target.value)} className="text-sm" placeholder={`Option ${String.fromCharCode(65 + j)}`} data-testid={`edit-option-${i}-${j}`} />
                          {j === q.correct_answer && <Badge className="flex-shrink-0 bg-green-50 text-green-700 border border-green-200">Correct</Badge>}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32"><Select value={q.difficulty || 'medium'} onValueChange={val => updateGeneratedQuestion(i, 'difficulty', val)}><SelectTrigger className="h-8 text-sm" data-testid={`edit-difficulty-${i}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                      <Input value={q.explanation || ''} onChange={e => updateGeneratedQuestion(i, 'explanation', e.target.value)} className="text-sm" placeholder="Explanation (optional)" data-testid={`edit-explanation-${i}`} />
                    </div>
                  </div>
                ))}
              </div>
              {generatedQuestions.length > 0 && (<div className="flex flex-col gap-2"><Button variant="outline" className="rounded-xl" onClick={() => setGeneratedQuestions(prev => [...prev, { question: '', options: Array.from({ length: numOptions }, () => ''), correct_answer: 0, difficulty: 'medium', explanation: '' }])} data-testid="add-question-btn"><Plus className="w-4 h-4 mr-2" /> Add Question</Button><Button onClick={saveQuiz} className="w-full rounded-xl" style={{ background: C.primary }} data-testid="save-quiz-btn"><Send className="w-4 h-4 mr-2" /> Save Quiz</Button></div>)}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
