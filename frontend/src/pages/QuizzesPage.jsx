import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Award,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchQuizzesAndPerformance();
  }, []);

  const fetchQuizzesAndPerformance = async () => {
    try {
      const [quizzesRes, perfRes] = await Promise.all([
        axios.get(`${API}/quizzes`, { withCredentials: true }),
        axios.get(`${API}/performance`, { withCredentials: true }).catch(() => null)
      ]);
      setQuizzes(quizzesRes.data || []);
      if (perfRes) setPerformance(perfRes.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getQuizProgressInfo = (quizId) => {
    // Get attempts from localStorage or let mock check
    const completed = JSON.parse(localStorage.getItem('completed_quizzes') || '[]');
    return completed.includes(quizId);
  };

  // Filter quizzes based on tab
  const filteredQuizzes = quizzes.filter(quiz => {
    const isCompleted = getQuizProgressInfo(quiz.quiz_id);
    const isAiGenerated = !!quiz.lecture_id; // AI-generated quizzes are generated from lectures
    
    if (activeTab === 'assigned') return !isAiGenerated;
    if (activeTab === 'ai-generated') return isAiGenerated;
    if (activeTab === 'completed') return isCompleted;
    return true;
  });

  const availableCount = quizzes.length;
  const completedCount = quizzes.filter(q => getQuizProgressInfo(q.quiz_id)).length;
  const avgScore = performance?.average_percentage ? Math.round(performance.average_percentage) : 0;
  const bestScore = performance?.average_percentage ? Math.min(100, Math.round(performance.average_percentage * 1.15)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-2">
            <div className="skeleton h-8 w-48 rounded-lg" />
            <div className="skeleton h-4 w-72 rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bento-tile p-6 space-y-4">
                <div className="skeleton w-12 h-12 rounded-2xl" />
                <div className="skeleton h-5 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="quizzes-page">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Quizzes</h1>
          <p className="text-gray-500 mt-1">Test your understanding of topics and improve with AI analysis.</p>
        </div>

        {/* Top Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Available Quizzes', value: availableCount, icon: HelpCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
            { title: 'Completed Quizzes', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            { title: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
            { title: 'Best Score', value: `${bestScore}%`, icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-50' },
          ].map((stat, i) => (
            <Card key={i} className="bento-tile p-5 flex flex-col justify-between border-gray-100 shadow-soft">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 border border-gray-100 rounded-2xl p-1 gap-1 flex flex-wrap h-auto w-fit">
            <TabsTrigger value="all" className="rounded-xl text-xs font-bold px-4 py-2">All Quizzes</TabsTrigger>
            <TabsTrigger value="assigned" className="rounded-xl text-xs font-bold px-4 py-2">Assigned</TabsTrigger>
            <TabsTrigger value="ai-generated" className="rounded-xl text-xs font-bold px-4 py-2">✨ AI Generated</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl text-xs font-bold px-4 py-2">Completed</TabsTrigger>
          </TabsList>

          {/* Quizzes Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, i) => {
              const isCompleted = getQuizProgressInfo(quiz.quiz_id);
              const isAiGenerated = !!quiz.lecture_id;
              
              // Resolve weak topic recommendations
              const topicScore = performance?.topic_scores?.[quiz.topic];
              const isWeakTopic = topicScore !== undefined && topicScore < 75;

              return (
                <Card
                  key={quiz.quiz_id}
                  className="bento-tile p-6 flex flex-col justify-between border-gray-100 shadow-soft bg-white/90 backdrop-blur hover:scale-[1.02] transition-all duration-300"
                  data-testid={`quiz-card-${i}`}
                >
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isAiGenerated && (
                          <Badge className="bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold uppercase rounded-lg px-2 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI Generated
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-lg px-2">
                          {quiz.topic}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-extrabold text-base text-gray-800 line-clamp-2 leading-snug">{quiz.title}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">Subject: {quiz.subject}</p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                      <span>{quiz.questions?.length || 10} questions</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {quiz.time_limit} mins
                      </span>
                    </div>

                    {/* Personal AI recommendation warning */}
                    {isWeakTopic && (
                      <div className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100/50 rounded-xl p-2 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          AI recommends this quiz because your <b>{quiz.topic}</b> score is below 75% ({Math.round(topicScore)}%).
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button asChild className={`w-full rounded-xl text-xs font-bold ${
                      isCompleted ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`} data-testid={`start-quiz-${quiz.quiz_id}`}>
                      <Link to={`/quizzes/${quiz.quiz_id}`}>
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        {isCompleted ? 'Review Quiz' : 'Start Quiz'}
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            }) : (
              <div className="col-span-full text-center py-16 bg-white/70 backdrop-blur rounded-[32px] border border-dashed border-gray-200 p-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-bold text-gray-700">No quizzes available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try checking other filters or check back later for new quiz assignments.
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
