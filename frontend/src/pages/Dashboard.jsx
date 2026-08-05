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
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import API, { debugLog, debugError } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [codingProfile, setCodingProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      debugLog('DASHBOARD', 'Fetching dashboard data from:', API);
      const [perfRes, rankRes, lectRes, annRes, codeRes] = await Promise.all([
        axios.get(`${API}/performance`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Performance fetch failed:', e.message);
          throw e;
        }),
        axios.get(`${API}/rankings/me`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Rankings fetch failed:', e.message);
          throw e;
        }),
        axios.get(`${API}/lectures?limit=5`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Lectures fetch failed:', e.message);
          throw e;
        }),
        axios.get(`${API}/announcements`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Announcements fetch failed:', e.message);
          throw e;
        }),
        axios.get(`${API}/coding-profile`, { withCredentials: true }).catch(e => {
          debugError('DASHBOARD', 'Coding profile fetch failed:', e.message);
          throw e;
        }),
      ]);
      
      debugLog('DASHBOARD', 'All data fetched successfully');
      setPerformance(perfRes.data);
      setRanking(rankRes.data);
      setLectures(lectRes.data);
      setAnnouncements(annRes.data);
      setCodingProfile(codeRes.data);
    } catch (error) {
      debugError('DASHBOARD', 'Error fetching dashboard data:', error.message, error.response?.status, error.response?.data);
      toast.error('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder chart data — last week merges with real average_percentage from backend
  const progressData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: performance?.average_percentage || 82 },
  ];

  const topicData = Object.entries(performance?.topic_scores || {}).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const statsCards = [
    {
      title: 'Average Score',
      value: `${Math.round(performance?.average_percentage || 0)}%`,
      icon: Target,
      color: 'text-accentText',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Quizzes Taken',
      value: performance?.total_quizzes || 0,
      icon: Award,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Class Rank',
      value: `#${ranking?.class_rank || '-'}`,
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Current Streak',
      value: `${performance?.streak || 0} days`,
      icon: Flame,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

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
    <div className="min-h-screen bg-background" data-testid="student-dashboard">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Track your progress, review lectures, and keep your streak going.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <Card key={i} className="card-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card className="animate-fade-in stagger-1" data-testid="progress-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Trend
                </CardTitle>
                <CardDescription>Your quiz scores over the past weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Lectures */}
            <Card className="animate-fade-in stagger-2" data-testid="recent-lectures">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Recent Lectures
                  </CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/lectures">View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lectures.length > 0 ? lectures.map((lecture, i) => (
                    <Link
                      key={lecture.lecture_id}
                      to={`/lectures/${lecture.lecture_id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors group"
                      data-testid={`lecture-item-${i}`}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Play className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lecture.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {lecture.subject} • {lecture.topic}
                        </p>
                      </div>
                      <Badge variant={lecture.status === 'completed' ? 'secondary' : 'outline'}>
                        {lecture.status}
                      </Badge>
                    </Link>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No lectures yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Mastery */}
            <Card className="animate-fade-in stagger-3" data-testid="topic-mastery">
              <CardHeader>
                <CardTitle className="text-lg">Topic Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                {topicData.length > 0 ? (
                  <div className="space-y-4">
                    {topicData.map((topic, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{topic.name}</span>
                          <span className="font-medium">{topic.value}%</span>
                        </div>
                        <Progress value={topic.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Complete quizzes to see topic mastery</p>
                )}
              </CardContent>
            </Card>

            {/* Coding Stats */}
            <Card className="animate-fade-in stagger-4" data-testid="coding-stats">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Coding Progress
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/coding">View <ChevronRight className="w-4 h-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-accentText">
                    {codingProfile?.total_problems || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Problems Solved</p>
                  {codingProfile?.leetcode && (
                    <div className="flex justify-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Easy: {codingProfile.leetcode.easy}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        Med: {codingProfile.leetcode.medium}
                      </Badge>
                      <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        Hard: {codingProfile.leetcode.hard}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="animate-fade-in stagger-5" data-testid="announcements">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {announcements.length > 0 ? announcements.map((ann, i) => (
                      <div key={ann.announcement_id} className="p-3 rounded-lg bg-accent/50">
                        <p className="font-medium text-sm">{ann.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ann.content}</p>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-4">No announcements</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
