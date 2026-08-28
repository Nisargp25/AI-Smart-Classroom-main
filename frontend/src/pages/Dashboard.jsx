import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  BookOpen,
  Award,
  Trophy,
  Code2,
  TrendingUp,
  Flame,
  Target,
  ChevronRight,
  Play,
  Bell,
  Sparkles,
  Calendar,
  ClipboardList,
  ExternalLink,
  Download,
  QrCode,
  CheckCircle2,
  RefreshCw,
  Bot,
  BrainCircuit,
  Activity,
  GraduationCap,
  Sparkle,
  ArrowRight,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';
import API, { debugLog, debugError } from '../lib/api';
import StreakBadge from '../components/ai-dashboard/StreakBadge';
import ProgressRing from '../components/ai-dashboard/ProgressRing';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';

export default function Dashboard() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [codingProfile, setCodingProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      debugLog('DASHBOARD', 'Fetching dashboard data from:', API);
      const [perfRes, rankRes, lectRes, annRes, codeRes, certRes, quizRes] = await Promise.all([
        axios.get(`${API}/performance`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Performance fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/rankings/me`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Rankings fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/lectures?limit=50`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Lectures fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/announcements`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Announcements fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/coding-profile`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Coding profile fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/certificates`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Certificates fetch failed:', e.message);
          return null;
        }),
        axios.get(`${API}/quizzes`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Quizzes fetch failed:', e.message);
          return null;
        })
      ]);

      if (perfRes) setPerformance(perfRes.data);
      if (rankRes) setRanking(rankRes.data);
      if (lectRes) setLectures(lectRes.data);
      if (annRes) setAnnouncements(annRes.data);
      if (codeRes) setCodingProfile(codeRes.data);
      if (certRes) setCertificates(certRes.data);
      if (quizRes) setQuizzes(quizRes.data);
    } catch (error) {
      debugError('DASHBOARD', 'Error fetching dashboard data:', error.message);
      toast.error('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const response = await axios.post(
        `${API}/certificates/generate`,
        { course_name: 'CampusAi Capstone Program' },
        { withCredentials: true }
      );
      setCertificates(prev => [response.data, ...prev]);
      toast.success('Certificate generated!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  const downloadCertificate = (cert) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    ctx.textAlign = 'center';

    // Base background
    ctx.fillStyle = '#f6f6f8';
    ctx.fillRect(0, 0, width, height);

    // Left corners
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(320, 0); ctx.lineTo(0, 210); ctx.closePath();
    ctx.fillStyle = '#2c3fe1'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(280, 0); ctx.lineTo(0, 170); ctx.closePath();
    ctx.fillStyle = '#1a2fb8'; ctx.fill();

    // Right corners
    ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width - 340, height); ctx.lineTo(width, height - 220); ctx.closePath();
    ctx.fillStyle = '#2c3fe1'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width - 300, height); ctx.lineTo(width, height - 180); ctx.closePath();
    ctx.fillStyle = '#1a2fb8'; ctx.fill();

    for (let i = 0; i < 18; i += 1) {
      const yOffset = i * 5;
      const alpha = 0.07 + i * 0.01;
      ctx.beginPath();
      ctx.moveTo(90, 520 + yOffset);
      ctx.bezierCurveTo(280, 410 + yOffset, 440, 700 - yOffset, 650, 540 + yOffset);
      ctx.bezierCurveTo(790, 430 + yOffset, 920, 360 + yOffset, 1130, 420 + yOffset);
      ctx.strokeStyle = i % 2 === 0 ? `rgba(64, 206, 216, ${alpha})` : `rgba(234, 76, 195, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#173f38'; ctx.font = 'bold 78px Georgia'; ctx.fillText('CERTIFICATE', centerX, 165);
    ctx.font = '52px Georgia'; ctx.fillText('OF APPRECIATION', centerX, 232);
    ctx.fillStyle = '#1f4740'; ctx.font = '48px Georgia'; ctx.fillText('This certificate is proudly presented to:', centerX, 306);
    ctx.fillStyle = '#1f5a4f'; ctx.font = 'italic 86px "Brush Script MT", "Times New Roman", serif'; ctx.fillText(cert.user_name || 'Student Name', centerX, 398);

    ctx.beginPath(); ctx.moveTo(305, 430); ctx.lineTo(895, 430); ctx.strokeStyle = '#b59c72'; ctx.lineWidth = 3; ctx.stroke();

    ctx.fillStyle = '#23453f'; ctx.font = '34px Arial'; ctx.fillText(`For outstanding work in ${cert.course_name || 'CampusAi Capstone Program'}`, centerX, 492);
    ctx.font = '30px Arial'; ctx.fillText(`Academic ${Math.round(cert.academic_score || 0)}%   |   Coding ${Math.round(cert.coding_score || 0)}   |   Rank #${cert.overall_rank || '-'}`, centerX, 538);
    const issuedOn = new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '26px Arial'; ctx.fillText(`Issued on ${issuedOn}`, centerX, 580);

    ctx.fillStyle = '#21594f'; ctx.font = 'italic 72px "Brush Script MT", "Times New Roman", serif'; ctx.fillText('Signature', centerX, 690);
    ctx.font = 'bold 48px Georgia'; ctx.fillText('CampusAi Manager', centerX, 748);
    ctx.font = '22px monospace'; ctx.fillStyle = '#3c5f59'; ctx.fillText(`Verification ID: ${cert.verification_code}`, centerX, 794);

    const sealX = 980; const sealY = 730; const rays = 18;
    for (let i = 0; i < rays; i += 1) {
      const angle = (Math.PI * 2 * i) / rays;
      const x1 = sealX + Math.cos(angle) * 42; const y1 = sealY + Math.sin(angle) * 42;
      const x2 = sealX + Math.cos(angle + 0.08) * 58; const y2 = sealY + Math.sin(angle + 0.08) * 58;
      const x3 = sealX + Math.cos(angle - 0.08) * 58; const y3 = sealY + Math.sin(angle - 0.08) * 58;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
      ctx.fillStyle = '#f0ba18'; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(sealX, sealY, 42, 0, Math.PI * 2); ctx.fillStyle = '#ffd74f'; ctx.fill();
    ctx.beginPath(); ctx.arc(sealX, sealY, 31, 0, Math.PI * 2); ctx.fillStyle = '#f6c218'; ctx.fill();
    ctx.beginPath(); ctx.arc(sealX, sealY, 27, 0, Math.PI * 2); ctx.fillStyle = '#fff0a4'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(sealX - 18, sealY + 34); ctx.lineTo(sealX - 54, sealY + 112); ctx.lineTo(sealX - 10, sealY + 92); ctx.fillStyle = '#f5c62c'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(sealX + 18, sealY + 34); ctx.lineTo(sealX + 54, sealY + 112); ctx.lineTo(sealX + 10, sealY + 92); ctx.fillStyle = '#f3bd20'; ctx.fill();

    const link = document.createElement('a');
    link.download = `certificate-${cert.verification_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Certificate downloaded!');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAskAssistant = (initialMessage = '') => {
    window.dispatchEvent(new CustomEvent('open-campus-ai-chat', { detail: { message: initialMessage } }));
  };

  const handleScrollToLectures = () => {
    const element = document.getElementById('continue-learning');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Process data filters
  const completedLecturesCount = lectures.filter(l => l.status === 'completed').length;
  const incompleteLectures = lectures.filter(l => l.status !== 'completed');
  const continueLearningLectures = incompleteLectures.length > 0 ? incompleteLectures.slice(0, 3) : lectures.slice(0, 3);

  // Dynamic AI Insights
  const aiInsights = [];
  
  // 1. Weak Topic Insight
  const weakTopicEntry = performance?.topic_scores 
    ? Object.entries(performance.topic_scores).find(([_, score]) => score < 75)
    : null;
  if (weakTopicEntry) {
    aiInsights.push({
      type: 'warning',
      title: 'Suggested Topic Focus',
      description: `Your average quiz score in ${weakTopicEntry[0]} is ${Math.round(weakTopicEntry[1])}%. We recommend reviewing the summaries and starting a practice quiz.`,
      icon: Target,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30'
    });
  } else {
    aiInsights.push({
      type: 'success',
      title: 'Strong Academic Foundation',
      description: 'Superb! All your quiz scores are currently above 75%. AI suggests trying more challenging assignments.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'
    });
  }

  // 2. Learning Trend Insight
  if (performance?.streak && performance.streak > 0) {
    aiInsights.push({
      type: 'trend',
      title: 'Momentum Boost',
      description: `Your ${performance.streak}-day learning streak is active! Consistent daily study improves long-term recall rates by over 40%.`,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
    });
  } else {
    aiInsights.push({
      type: 'info',
      title: 'Ready for a Streak?',
      description: 'Complete your next quiz or study session today to start your learning streak and unlock daily badges.',
      icon: Flame,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30'
    });
  }

  // 3. Recommended revision
  const oldestLec = lectures.find(l => l.status === 'completed');
  if (oldestLec) {
    aiInsights.push({
      type: 'revision',
      title: 'Recommended Revision',
      description: `Revisit "${oldestLec.title}" to cement these concepts before your next major evaluation.`,
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30'
    });
  }

  // Personal AI Learning Map nodes based on performance
  const getTopicScore = (topicName) => {
    if (!performance?.topic_scores) return null;
    const key = Object.keys(performance.topic_scores).find(
      k => k.toLowerCase().includes(topicName.toLowerCase())
    );
    return key ? Math.round(performance.topic_scores[key]) : null;
  };

  const learningMapNodes = [
    { name: 'Algorithms', progress: getTopicScore('Algorithms') ?? 78, difficulty: 'Hard', confidence: 84 },
    { name: 'OOP', progress: getTopicScore('OOP') ?? getTopicScore('Object Oriented') ?? 82, difficulty: 'Medium', confidence: 91 },
    { name: 'Data Structures', progress: getTopicScore('Data Structures') ?? 74, difficulty: 'Hard', confidence: 79 },
    { name: 'DBMS', progress: getTopicScore('DBMS') ?? getTopicScore('Database') ?? 91, difficulty: 'Easy', confidence: 95 },
    { name: 'AI / ML', progress: getTopicScore('AI') ?? getTopicScore('Machine Learning') ?? 68, difficulty: 'Hard', confidence: 72 },
  ];

  const mapOrder = ['Algorithms', 'OOP', 'Data Structures', 'DBMS', 'AI / ML'];
  const nodePos = {
    'Algorithms': { x: 50, y: 8 },
    'OOP': { x: 12, y: 42 },
    'Data Structures': { x: 50, y: 46 },
    'DBMS': { x: 88, y: 42 },
    'AI / ML': { x: 50, y: 84 },
  };
  const mapEdges = [[1, 2], [2, 3], [2, 0], [2, 4]];

  // Upcoming Activities (database live items + mock assignments)
  const upcomingQuizzes = quizzes.slice(0, 2);
  const upcomingLectures = lectures.filter(l => l.status === 'pending').slice(0, 1);
  const upcomingAssignments = [
    { title: 'Data Structures Lab 3', detail: 'Due in 3 days', priority: 'Medium', tagColor: 'bg-amber-100 text-amber-600' }
  ];

  // Recent Activity Feed
  const recentActivities = [];
  if (certificates && certificates.length > 0) {
    certificates.forEach(c => {
      recentActivities.push({
        type: 'certificate',
        title: `Earned Certificate: ${c.course_name}`,
        time: new Date(c.issued_at).toLocaleDateString(),
        detail: `Academic: ${Math.round(c.academic_score)}% | Rank: #${c.overall_rank}`,
        icon: Award,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
      });
    });
  }
  if (lectures && lectures.length > 0) {
    lectures.filter(l => l.status === 'completed').slice(0, 3).forEach(l => {
      recentActivities.push({
        type: 'lecture',
        title: `Completed Lecture: ${l.title}`,
        time: new Date(l.created_at).toLocaleDateString(),
        detail: `Subject: ${l.subject}`,
        icon: BookOpen,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
      });
    });
  }
  if (performance?.total_quizzes && performance.total_quizzes > 0) {
    recentActivities.push({
      type: 'quiz',
      title: `Submitted Quiz Attempt`,
      time: 'Recently',
      detail: `Average Score: ${Math.round(performance.average_percentage)}%`,
      icon: Target,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20'
    });
  }
  if (recentActivities.length === 0) {
    recentActivities.push({
      type: 'achievement',
      title: 'Joined CampusAI Platform',
      time: 'Recently',
      detail: 'Welcome! Complete lectures and quizzes to build your activity feed.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="student-dashboard">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============ 1. HERO SECTION ============ */}
        <section className="relative overflow-hidden mb-8 p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100/50 shadow-soft">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 animate-twinkle" /> Learn, improve and achieve
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  AI Status: Active
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0]} 👋
              </h1>
              
              <p className="text-gray-600 max-w-xl text-base leading-relaxed">
                Ready to continue your personalized learning path? You have completed <span className="font-semibold text-indigo-600">{completedLecturesCount} lectures</span> and your current streak is <span className="font-semibold text-orange-500">{performance?.streak || 0} days</span>. Keep up the momentum!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button 
                  onClick={handleScrollToLectures}
                  className="px-6 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  Continue Learning <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => handleAskAssistant()}
                  variant="outline"
                  className="px-6 py-5 rounded-2xl bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-indigo-600" /> Ask CampusAI
                </Button>
              </div>
            </div>

            {/* Premium AI learning visual */}
            <div className="relative shrink-0 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-indigo-400/10 rounded-full blur-2xl animate-pulse-glow" />
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-1 text-indigo-600">
                    <Brain className="w-6 h-6 animate-float-slow" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {Math.round(performance?.average_percentage || 0)}%
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    AI Score
                  </p>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-1 -left-1 bg-white/95 border border-indigo-100 rounded-2xl p-2 px-3 shadow-md flex items-center gap-1.5 scale-90">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-gray-800">{performance?.streak || 0} Day Streak</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white/95 border border-indigo-100 rounded-2xl p-2 px-3 shadow-md flex items-center gap-1.5 scale-90">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-800">Rank #{ranking?.class_rank || '-'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2. PERSONAL STATISTICS GRID ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              title: 'Lectures Completed',
              value: completedLecturesCount,
              desc: 'From syllabus',
              icon: BookOpen,
              color: 'text-indigo-600',
              bgColor: 'bg-indigo-50',
              borderColor: 'border-indigo-100'
            },
            {
              title: 'Quizzes Completed',
              value: performance?.total_quizzes || 0,
              desc: 'Evaluated items',
              icon: Award,
              color: 'text-cyan-600',
              bgColor: 'bg-cyan-50',
              borderColor: 'border-cyan-100'
            },
            {
              title: 'Average Score',
              value: `${Math.round(performance?.average_percentage || 0)}%`,
              desc: 'Overall percentage',
              icon: Target,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              borderColor: 'border-emerald-100'
            },
            {
              title: 'Learning Streak',
              value: `${performance?.streak || 0} days`,
              desc: 'Streak count',
              icon: Flame,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              borderColor: 'border-orange-100'
            }
          ].map((stat, i) => (
            <Card key={i} className="bento-tile p-5 flex flex-col justify-between border-gray-100 shadow-soft">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.desc}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ============ BENTO GRID SPLIT LAYOUT ============ */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ============ 3. CONTINUE LEARNING ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft" id="continue-learning">
              <CardHeader className="p-0 flex flex-row items-center justify-between mb-5">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">Pick up where you left off in your study path</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1" asChild>
                  <Link to="/lectures">View All Lectures <ChevronRight className="w-4 h-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-3 gap-4">
                  {continueLearningLectures.length > 0 ? continueLearningLectures.map((lecture, i) => {
                    const isCompleted = lecture.status === 'completed';
                    let progressValue = 15;
                    let progressColor = 'bg-indigo-600';
                    if (lecture.status === 'completed') {
                      progressValue = 100;
                      progressColor = 'bg-emerald-500';
                    } else if (lecture.status === 'processing' || lecture.status === 'transcribing') {
                      progressValue = 60;
                      progressColor = 'bg-indigo-400';
                    }
                    return (
                      <Card key={lecture.lecture_id} className="border border-gray-100 hover:border-indigo-100 shadow-soft rounded-2xl flex flex-col justify-between overflow-hidden bg-white/70 backdrop-blur transition-all duration-300">
                        <div className="p-4 space-y-3">
                          <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 border border-indigo-100/50 rounded-lg">
                            {lecture.subject}
                          </Badge>
                          <div>
                            <h4 className="font-bold text-sm text-gray-800 line-clamp-2 min-h-[40px]">
                              {lecture.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1">Topic: {lecture.topic}</p>
                          </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-gray-50/50 bg-gray-50/20 space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                              <span>Progress</span>
                              <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>
                                {progressValue}%
                              </span>
                            </div>
                            <Progress value={progressValue} className="h-1.5" indicatorClassName={progressColor} />
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
                            <span>Studied: {new Date(lecture.created_at).toLocaleDateString()}</span>
                            <Button size="sm" className="h-7 px-3 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium" asChild>
                              <Link to={`/lectures/${lecture.lecture_id}`}>
                                {isCompleted ? 'Review' : 'Resume'}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  }) : (
                    <div className="col-span-3 text-center py-10">
                      <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-500">No lectures available</p>
                      <p className="text-xs text-gray-400 mt-1">Wait for your teachers to post new syllabus recordings.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ============ 9. PERSONAL AI LEARNING MAP ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  Personal AI Learning Map
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Visual mapping of your academic progress & quiz confidence values</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-full md:w-3/5">
                  <svg viewBox="0 0 100 100" className="w-full h-[280px]">
                    {mapEdges.map((e, i) => {
                      const a = nodePos[mapOrder[e[0]]];
                      const b = nodePos[mapOrder[e[1]]];
                      return (
                        <g key={i}>
                          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3" />
                          <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r="0.8" fill="#a855f7" />
                        </g>
                      );
                    })}
                    {mapOrder.map((name, i) => {
                      const p = nodePos[name];
                      const isCenter = i === 2; // Data Structures
                      return (
                        <g key={name}>
                          <circle cx={p.x} cy={p.y} r="8.5" fill="#fff" stroke={isCenter ? '#8B5CF6' : '#4F46E5'} strokeWidth="0.8" />
                          <circle cx={p.x} cy={p.y} r="3.5" fill={isCenter ? '#8B5CF6' : '#4F46E5'} />
                        </g>
                      );
                    })}
                  </svg>
                  {mapOrder.map((name, i) => {
                    const n = learningMapNodes[i];
                    const p = nodePos[name];
                    const isCenter = i === 2;
                    return (
                      <div key={name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                        <div className="bg-white/95 border border-indigo-50 rounded-2xl p-2 shadow-md min-w-[95px] select-none hover:scale-105 hover:border-indigo-200 transition-all duration-300">
                          <p className="font-semibold text-gray-800 text-[10px] truncate">{name}</p>
                          <p className={`font-black text-sm my-0.5 ${isCenter ? 'text-purple-600' : 'text-indigo-600'}`}>
                            {n.progress}%
                          </p>
                          <p className="text-[8px] text-gray-400 font-bold">{n.difficulty} · Confidence</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full md:w-2/5 space-y-4">
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 space-y-3">
                    <h5 className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" />
                      Map Intelligence Status
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      AI maps your quiz performance to estimate conceptual confidence. To update this map:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                      <li>Complete subject-specific quiz evaluations.</li>
                      <li>Review lectures of topics marked under 75%.</li>
                      <li>Submit homework to reinforce key concepts.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============ 8. RECENT ACTIVITY timeline ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Your latest platform accomplishments and submissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6 pl-4 border-l border-indigo-100 relative">
                  {recentActivities.map((act, idx) => (
                    <div key={idx} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[27px] top-0.5 w-[14px] h-[14px] rounded-full border-[2.5px] border-white ring-2 ring-indigo-100 flex items-center justify-center ${act.type === 'certificate' ? 'bg-emerald-500' : act.type === 'lecture' ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-semibold text-gray-800 text-sm">{act.title}</span>
                        <span>{act.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">{act.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT 1/3 SIDEBAR COLUMN */}
          <div className="space-y-8">
            
            {/* ============ 4. CAMPUSAI LEARNING INTELLIGENCE ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  CampusAI Intelligence
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Personalized AI insights to maximize retention</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${insight.color} flex gap-3 transition-colors hover:bg-opacity-80`}>
                    <div className="shrink-0 mt-0.5">
                      <insight.icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-gray-800">{insight.title}</h4>
                      <p className="text-xs leading-relaxed text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ============ 5. CAMPUSAI ASSISTANT ============ */}
            <Card className="bento-tile p-6 border-indigo-100 shadow-lg bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <CardHeader className="p-0 space-y-2 mb-5">
                <Badge className="bg-indigo-500/20 border-indigo-400/30 text-indigo-200 text-[10px] font-bold px-2.5 py-1 w-fit rounded-full uppercase tracking-wider">
                  Always Online
                </Badge>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  CampusAI Assistant
                </CardTitle>
                <CardDescription className="text-xs text-indigo-200/70">
                  Ask course summaries, generate study plans, or get coding explanations instantly.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-indigo-100/90 leading-relaxed font-mono">
                  💡 Tip: Click "Generate Study Plan" to lay out a structured calendar based on your weak syllabus topics.
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAskAssistant()}
                    className="flex-1 bg-white hover:bg-gray-100 text-indigo-950 font-bold rounded-2xl py-4 text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Ask CampusAI
                  </Button>
                  <Button 
                    onClick={() => handleAskAssistant('Please generate a personalized study plan for my weak topics.')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-4 text-xs shadow-md border border-indigo-500/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    Generate Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ============ 6. UPCOMING ACTIVITIES ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Activities
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Evaluations, sessions and assignments due soon</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                
                {/* Quizzes */}
                {upcomingQuizzes.length > 0 && upcomingQuizzes.map((quiz) => (
                  <Link 
                    key={quiz.quiz_id}
                    to={`/quizzes/${quiz.quiz_id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/30 hover:bg-indigo-50 transition-all group"
                  >
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate group-hover:text-indigo-700 transition-colors">
                        {quiz.title}
                      </p>
                      <p className="text-[10px] text-gray-400">Subject: {quiz.subject}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                      Take Quiz
                    </span>
                  </Link>
                ))}

                {/* Live Lectures */}
                {upcomingLectures.map((lec) => (
                  <Link 
                    key={lec.lecture_id}
                    to={`/lectures/${lec.lecture_id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-50/40 border border-cyan-100/30 hover:bg-cyan-50 transition-all group"
                  >
                    <span className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                      <Play className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate group-hover:text-cyan-700 transition-colors">
                        {lec.title}
                      </p>
                      <p className="text-[10px] text-gray-400">Processing live session</p>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-600 bg-white border border-cyan-100 px-2 py-0.5 rounded-full shrink-0">
                      View Status
                    </span>
                  </Link>
                ))}

                {/* Assignments (simulated) */}
                {upcomingAssignments.map((ass, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100/30 transition-all">
                    <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <ClipboardList className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate">{ass.title}</p>
                      <p className="text-[10px] text-gray-400">{ass.detail}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ass.tagColor}`}>
                      {ass.priority}
                    </span>
                  </div>
                ))}

                {upcomingQuizzes.length === 0 && upcomingLectures.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No upcoming evaluations or sessions</p>
                )}
              </CardContent>
            </Card>

            {/* ============ 7. MY CERTIFICATES ============ */}
            <Card className="bento-tile p-6 border-gray-100 shadow-soft">
              <CardHeader className="p-0 flex flex-row items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    My Certificates
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">Your earned credentials & capstone programs</CardDescription>
                </div>
                {certificates.length === 0 && (
                  <Button 
                    onClick={generateCertificate} 
                    disabled={generatingCert}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-7 text-[10px] font-bold"
                  >
                    {generatingCert ? 'Generating...' : 'Claim Demo'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {certificates.length > 0 ? certificates.map((cert) => (
                  <div key={cert.certificate_id} className="border border-gray-100 hover:border-indigo-100 rounded-2xl overflow-hidden bg-white/50 backdrop-blur shadow-sm p-4 space-y-4 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-gray-800 truncate">{cert.course_name}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-gray-50/50 p-2 rounded-xl border border-gray-50 text-center">
                      <div>
                        <p className="font-black text-xs text-indigo-600">{Math.round(cert.academic_score)}%</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Acad</p>
                      </div>
                      <div>
                        <p className="font-black text-xs text-cyan-600">{Math.round(cert.coding_score)}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Code</p>
                      </div>
                      <div>
                        <p className="font-black text-xs text-purple-600">#{cert.overall_rank}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Rank</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold rounded-lg border-gray-200" asChild>
                        <a 
                          href={`${API}/certificates/verify/${cert.verification_code}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1 text-gray-500" /> Verify
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => downloadCertificate(cert)}
                        className="flex-1 h-8 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                    <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500">No certificates issued yet</p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto">
                      Earn certificates by completing syllabus quizzes. Click "Claim Demo" to preview.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

      </main>

      {/* Shared Student AI Chatbot overlay */}
      <FloatingAIButton />
    </div>
  );
}
