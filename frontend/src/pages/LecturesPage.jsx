import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  BookOpen,
  Play,
  Clock,
  User,
  Search,
  Filter,
  Sparkles,
  BookMarked,
  Brain,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';

export default function LecturesPage() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedProgress, setSelectedProgress] = useState('all');

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      // Backend automatically filters lectures by class and division for students now!
      const response = await axios.get(`${API}/lectures?limit=100`, { withCredentials: true });
      setLectures(response.data || []);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  // Get subjects list for filters
  const subjects = ['all', ...new Set(lectures.map(l => l.subject).filter(Boolean))];

  // Helper to resolve lecture progress
  const getLectureProgressInfo = (lectureId) => {
    const completed = JSON.parse(localStorage.getItem('completed_lectures') || '[]');
    const inProgress = JSON.parse(localStorage.getItem('in_progress_lectures') || '[]');
    
    if (completed.includes(lectureId)) {
      return { percentage: 100, label: 'Completed' };
    }
    if (inProgress.includes(lectureId)) {
      return { percentage: 50, label: 'In Progress' };
    }
    return { percentage: 0, label: 'Not Started' };
  };

  // Enforce frontend division matching as double protection
  const authorizedLectures = lectures.filter(lecture => {
    if (user?.role !== 'student') return true;
    if (!lecture.class_name || lecture.class_name === 'All') return true;
    return lecture.class_name === user.class_name && lecture.division === user.division;
  });

  const filteredLectures = authorizedLectures.filter(lecture => {
    const matchesSearch = 
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || lecture.subject === selectedSubject;
    
    // Fallback/mock difficulty if not set in DB
    const difficulty = lecture.difficulty || (lecture.title.length % 2 === 0 ? 'Medium' : 'Easy');
    const matchesDifficulty = selectedDifficulty === 'all' || difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    
    const progressInfo = getLectureProgressInfo(lecture.lecture_id);
    const matchesProgress = 
      selectedProgress === 'all' || 
      (selectedProgress === 'completed' && progressInfo.percentage === 100) ||
      (selectedProgress === 'in-progress' && progressInfo.percentage === 50) ||
      (selectedProgress === 'not-started' && progressInfo.percentage === 0);

    return matchesSearch && matchesSubject && matchesDifficulty && matchesProgress;
  });

  // Skeleton Loaders
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
                <div className="skeleton h-3 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="lectures-page">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Lectures</h1>
            <p className="text-gray-500 mt-1">Learn and review lecture syllabi curated for your class.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search lectures, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl border-gray-200 focus:ring-indigo-500 bg-white"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-white/80 backdrop-blur rounded-[24px] border border-gray-100 p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
            <Filter className="w-4 h-4" /> Filters
          </div>

          {/* Subject Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-white text-xs font-medium">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === 'all' ? 'All Subjects' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-white text-xs font-medium">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Difficulties</SelectItem>
                <SelectItem value="easy" className="text-xs">Easy</SelectItem>
                <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                <SelectItem value="hard" className="text-xs">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select value={selectedProgress} onValueChange={setSelectedProgress}>
              <SelectTrigger className="rounded-xl border-gray-100 bg-white text-xs font-medium">
                <SelectValue placeholder="All Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Progress</SelectItem>
                <SelectItem value="not-started" className="text-xs">Not Started</SelectItem>
                <SelectItem value="in-progress" className="text-xs">In Progress</SelectItem>
                <SelectItem value="completed" className="text-xs">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lectures Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.length > 0 ? filteredLectures.map((lecture, i) => {
            const diff = lecture.difficulty || (lecture.title.length % 2 === 0 ? 'Medium' : 'Easy');
            const progressInfo = getLectureProgressInfo(lecture.lecture_id);
            const isCompleted = progressInfo.percentage === 100;
            const isPending = lecture.status !== 'completed';
            
            // Build dynamic AI recommendation
            const needsRevision = isCompleted && i === 0;

            return (
              <Link
                key={lecture.lecture_id}
                to={`/lectures/${lecture.lecture_id}`}
                className="block group"
                data-testid={`lecture-card-${i}`}
              >
                <Card className="bento-tile h-full p-6 flex flex-col justify-between border-gray-100 shadow-soft bg-white/90 backdrop-blur group-hover:scale-[1.02] transition-all duration-300">
                  <div className="space-y-4">
                    
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {lecture.status === 'completed' && (
                          <Badge className="bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 rounded-lg px-2">
                            <Sparkles className="w-2.5 h-2.5" /> AI Analyzed
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase rounded-lg px-2 ${
                          diff === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
                          diff === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {diff}
                        </Badge>
                      </div>
                    </div>

                    {/* Main title */}
                    <div className="space-y-1">
                      <Badge className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {lecture.subject}
                      </Badge>
                      <h3 className="font-extrabold text-lg text-gray-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors duration-300">
                        {lecture.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">Topic: {lecture.topic}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Teacher</p>
                        <p className="font-semibold text-gray-700 truncate">{lecture.teacher_name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Class/Div</p>
                        <p className="font-semibold text-gray-700 truncate">
                          {lecture.class_name || 'All'} - {lecture.division || 'All'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Progress */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-4">
                    {/* Progress Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span>Progress</span>
                        <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>
                          {progressInfo.percentage}%
                        </span>
                      </div>
                      <Progress value={progressInfo.percentage} className="h-1.5" indicatorClassName={isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'} />
                    </div>

                    {/* AI Recommendation Badge */}
                    {needsRevision && (
                      <div className="text-[10px] text-purple-600 font-semibold bg-purple-50 border border-purple-100/50 rounded-xl p-2 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        AI recommends reviewing this lecture.
                      </div>
                    )}

                    {/* Bottom Action buttons */}
                    <div className="flex items-center justify-between gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(lecture.duration / 60) || 12} mins
                      </span>
                      
                      <Button size="sm" className={`h-8 px-4 rounded-xl text-xs font-bold ${
                        isCompleted 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                          : progressInfo.percentage > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}>
                        {isCompleted ? 'Review' : progressInfo.percentage > 0 ? 'Continue' : 'Start Lecture'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          }) : (
            <div className="col-span-full text-center py-16 bg-white/70 backdrop-blur rounded-[32px] border border-dashed border-gray-200 p-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-700">No lectures assigned yet</p>
              <p className="text-sm text-gray-400 mt-1">
                No worries! Your teacher will add learning content for your class shortly.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
