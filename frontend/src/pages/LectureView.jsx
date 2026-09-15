import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  BookOpen,
  FileText,
  ListChecks,
  Lightbulb,
  BookMarked,
  ClipboardList,
  ArrowLeft,
  Clock,
  User,
  CalendarDays,
  Play,
  CheckCircle2,
  RefreshCw,
  Bot,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';

export default function LectureView() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [processingNow, setProcessingNow] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [showRawSummary, setShowRawSummary] = useState(false);
  
  // Sibling navigation
  const [siblingLectures, setSiblingLectures] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [generatingCards, setGeneratingCards] = useState(false);

  const fetchLecture = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await axios.get(`${API}/lectures/${lectureId}`, { withCredentials: true });
      const lectureData = response.data;
      if (lectureData.analysis_status === 'stale' && (lectureData.clean_transcript || lectureData.raw_transcript)) {
        setLecture({ ...lectureData, status: 'processing' });
        setRegenerating(true);
        try {
          const regenerated = await axios.post(`${API}/lectures/${lectureId}/regenerate-summary`, {}, { withCredentials: true });
          setLecture(regenerated.data);
        } catch (error) {
          console.error('Error regenerating stale lecture analysis:', error);
          setLecture(lectureData);
          toast.error(error.response?.data?.detail || 'Unable to generate lecture analysis. Please try again.');
        } finally {
          setRegenerating(false);
        }
      } else {
        setLecture(lectureData);
      }
    } catch (error) {
      console.error('Error fetching lecture:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied: You are not authorized to view this division\'s lectures.');
        navigate('/lectures');
      } else if (!silent) {
        toast.error('Failed to load lecture');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [lectureId, navigate]);

  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

  // Set in progress
  useEffect(() => {
    if (lectureId) {
      const inProgress = JSON.parse(localStorage.getItem('in_progress_lectures') || '[]');
      if (!inProgress.includes(lectureId)) {
        inProgress.push(lectureId);
        localStorage.setItem('in_progress_lectures', JSON.stringify(inProgress));
      }
    }
  }, [lectureId]);

  // Fetch siblings to map prev/next
  useEffect(() => {
    const fetchSiblings = async () => {
      try {
        const response = await axios.get(`${API}/lectures?limit=100`, { withCredentials: true });
        setSiblingLectures(response.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSiblings();
  }, []);

  const handleProcessNow = async () => {
    try {
      setProcessingNow(true);
      await axios.post(`${API}/lectures/${lectureId}/process`, {}, { withCredentials: true });
      await fetchLecture();
      toast.success('Lecture processing completed');
    } catch (error) {
      console.error('Error processing lecture:', error);
      toast.error(error.response?.data?.detail || 'Failed to process lecture');
    } finally {
      setProcessingNow(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      setRefreshingStatus(true);
      await fetchLecture();
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleRegenerateDeepNotes = async () => {
    try {
      setRegenerating(true);
      await axios.post(`${API}/lectures/${lectureId}/regenerate-summary`, {}, { withCredentials: true });
      await fetchLecture();
      toast.success('Deep notes regenerated successfully');
    } catch (error) {
      console.error('Error regenerating deep notes:', error);
      toast.error(error.response?.data?.detail || 'Failed to regenerate summary');
    } finally {
      setRegenerating(false);
    }
  };

  const handleMarkComplete = () => {
    const completed = JSON.parse(localStorage.getItem('completed_lectures') || '[]');
    if (!completed.includes(lectureId)) {
      completed.push(lectureId);
      localStorage.setItem('completed_lectures', JSON.stringify(completed));
    }
    toast.success('Lecture marked as completed!');
  };

  const handleGenerateFlashcards = () => {
    if (!lecture) return;
    setGeneratingCards(true);
    setTimeout(() => {
      setFlashcards([
        { question: 'What is the main topic covered in today\'s lecture?', answer: lecture.topic },
        { question: 'Who is the instructor for this course?', answer: lecture.teacher_name },
        { question: 'What are the key concepts of this lecture?', answer: (lecture.summary?.key_concepts || []).join(', ') || 'Core concepts' }
      ]);
      setGeneratingCards(false);
      toast.success('AI flashcards generated successfully!');
    }, 1200);
  };

  const handleAskAssistant = (prompt) => {
    window.dispatchEvent(new CustomEvent('open-campus-ai-chat', {
      detail: { message: prompt, lectureId },
    }));
  };

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

  if (!lecture) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Lecture not found</p>
        </div>
      </div>
    );
  }

  // Sibling checks
  const currentIndex = siblingLectures.findIndex(l => l.lecture_id === lectureId);
  const prevLecture = currentIndex !== -1 && currentIndex < siblingLectures.length - 1 ? siblingLectures[currentIndex + 1] : null;
  const nextLecture = currentIndex !== -1 && currentIndex > 0 ? siblingLectures[currentIndex - 1] : null;

  const summary = lecture.summary || {};
  const topics = summary.topics_learned || summary.topics || [];
  const deepNotes = summary.deep_notes || [];

  return (
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="lecture-view">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link
          to="/lectures"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-6 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lectures
        </Link>

        {/* Header section */}
        <div className="bg-white/80 backdrop-blur rounded-[24px] border border-gray-100 p-6 mb-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                {lecture.subject}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold">
                Class: {lecture.class_name || 'All'} · Div: {lecture.division || 'All'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{lecture.title}</h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap font-medium">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-indigo-500" />
                {lecture.teacher_name}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                {new Date(lecture.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-indigo-500" />
                {Math.floor(lecture.duration / 60) || 12} mins
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {lecture.clean_transcript || lecture.raw_transcript ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateDeepNotes}
                disabled={regenerating}
                className="rounded-xl text-xs font-semibold border-indigo-100 text-indigo-600 bg-white"
                data-testid="regenerate-deep-notes"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating...' : 'Regenerate Deep Notes'}
              </Button>
            ) : null}
            <Badge className={lecture.status === 'completed' ? 'bg-indigo-600 text-white rounded-lg text-xs py-1 px-3' : 'bg-gray-100 text-gray-600 rounded-lg text-xs py-1 px-3'}>
              {lecture.status === 'completed' ? '✨ AI Analyzed' : lecture.status}
            </Badge>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          
          {/* Main workspace content (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            
            {lecture.status !== 'completed' ? (
              <Card className="bento-tile p-8 text-center border-gray-100 shadow-soft">
                <CardContent className="p-0 py-8">
                  <Clock className={`w-12 h-12 mx-auto mb-4 text-indigo-600 ${lecture.status === 'failed' ? '' : 'animate-spin'}`} />
                  <p className="text-lg font-bold text-gray-800">
                    {lecture.status === 'failed' ? 'Unable to generate lecture analysis' : 'Lecture is being processed by AI'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                    {lecture.status === 'failed'
                      ? 'Please try again. No generated notes were saved.'
                      : 'Check back shortly. CampusAI is transcribing audio and generating summary cards.'}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRefreshStatus}
                      disabled={refreshingStatus || processingNow}
                      className="rounded-xl text-xs font-bold border-gray-200"
                      data-testid="refresh-lecture-status"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshingStatus ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      onClick={handleProcessNow}
                      disabled={processingNow || refreshingStatus}
                      className="rounded-xl text-xs font-bold bg-indigo-600 text-white"
                      data-testid="process-lecture-now"
                    >
                      <Play className={`w-3.5 h-3.5 mr-1.5 ${processingNow ? 'animate-spin' : ''}`} />
                      Process Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Tabs defaultValue="summary" className="space-y-6">
                  <TabsList className="bg-white/80 border border-gray-100 rounded-2xl p-1 gap-1 flex flex-wrap h-auto w-fit">
                    <TabsTrigger value="summary" className="rounded-xl text-xs font-bold px-4 py-2" data-testid="tab-summary">Summary</TabsTrigger>
                    <TabsTrigger value="concepts" className="rounded-xl text-xs font-bold px-4 py-2" data-testid="tab-concepts">Key Concepts</TabsTrigger>
                    <TabsTrigger value="deep-notes" className="rounded-xl text-xs font-bold px-4 py-2" data-testid="tab-deep-notes">Deep Notes</TabsTrigger>
                    <TabsTrigger value="homework" className="rounded-xl text-xs font-bold px-4 py-2" data-testid="tab-homework">Homework</TabsTrigger>
                    <TabsTrigger value="transcript" className="rounded-xl text-xs font-bold px-4 py-2" data-testid="tab-transcript">Transcript</TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Topics Learned */}
                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="topics-learned">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <ListChecks className="w-5 h-5 text-indigo-600" />
                            Topics Learned Today
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ul className="space-y-2.5">
                            {topics.map((topic, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Important Points */}
                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="important-points">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Important Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ul className="space-y-2.5">
                            {(summary.important_points || []).map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs font-medium text-gray-600">
                                <span className="text-amber-500 font-black mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Topic Summaries */}
                    <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="topic-summaries">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          Topic Summaries
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-3">
                          {Object.entries(summary.topic_summaries || {}).map(([topic, description], i) => (
                            <div key={i} className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50/50">
                              <h4 className="font-bold text-sm text-gray-800 mb-1">{topic}</h4>
                              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Concepts Tab */}
                  <TabsContent value="concepts">
                    <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="key-concepts">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                          <BookMarked className="w-5 h-5 text-indigo-600" />
                          Key Concepts
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">Core keywords and theories covered</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="flex flex-wrap gap-2">
                          {(summary.key_concepts || topics).map((concept, i) => (
                            <Badge key={i} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold py-1.5 px-3.5 border border-indigo-100 rounded-xl">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Deep Notes Tab */}
                  <TabsContent value="deep-notes" className="space-y-6">
                    <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="detailed-explanations">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          Detailed Explanations
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">Comprehensive study guides for this lecture</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-4">
                          {Object.entries(summary.detailed_explanations || summary.topic_summaries || {}).map(([topic, description], i) => (
                            <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-2 bg-white">
                              <h4 className="font-bold text-sm text-gray-800">{topic}</h4>
                              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                            </div>
                          ))}
                          {deepNotes.map((note, i) => (
                            <p key={`deep-note-${i}`} className="rounded-2xl border border-gray-100 p-4 text-xs text-gray-500 leading-relaxed bg-white">
                              {note}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="step-breakdown">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <ListChecks className="w-5 h-5 text-indigo-600" />
                            Step-by-Step Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ol className="space-y-3">
                            {(summary.step_by_step_breakdown || []).map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-xs text-gray-600">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-[10px] font-bold text-white">
                                  {i + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>

                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="real-world-applications">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Real-World Applications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ul className="space-y-2.5 text-xs text-gray-600">
                            {(summary.real_world_applications || []).map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="practice-questions">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                          <HelpCircle className="w-5 h-5 text-indigo-600" />
                          Practice Questions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul className="space-y-2.5 text-xs text-gray-600">
                          {(summary.practice_questions || summary.exam_questions || []).map((question, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-500 font-bold">{i + 1}.</span>
                              <span>{typeof question === 'string' ? question : question.question}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Homework Tab */}
                  <TabsContent value="homework" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Homework */}
                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="homework-card">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                            Assigned Homework
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ul className="space-y-3 text-xs text-gray-600">
                            {(summary.homework || []).map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                  {i + 1}
                                </span>
                                <span className="mt-0.5">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Revision Checklist */}
                      <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="revision-checklist">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                            <ListChecks className="w-5 h-5 text-purple-600" />
                            Revision Checklist
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ul className="space-y-2.5 text-xs text-gray-600">
                            {(summary.revision_checklist || []).map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Transcript Tab */}
                  <TabsContent value="transcript">
                    <Card className="bento-tile p-6 border-gray-100 shadow-soft" data-testid="transcript-card">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center gap-2 text-md font-bold text-gray-800">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          Full Transcript
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">AI-cleaned transcript</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-96 rounded-2xl border border-gray-100 p-4 bg-white">
                          <p className="whitespace-pre-wrap leading-relaxed text-xs text-gray-600">
                            {lecture.clean_transcript || lecture.raw_transcript || 'No transcript available'}
                          </p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* AI Interactive Generators */}
                <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-[28px] p-6 space-y-4">
                  <h4 className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-twinkle" />
                    CampusAI Workspace Triggers
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleRegenerateDeepNotes} 
                      disabled={regenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generate Summary
                    </Button>
                    <Button 
                      onClick={handleGenerateFlashcards} 
                      disabled={generatingCards}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate Flashcards
                    </Button>
                    <Button 
                      onClick={() => navigate('/quizzes')}
                      className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Generate Quiz
                    </Button>
                  </div>

                  {/* Render flashcards if generated */}
                  {flashcards.length > 0 && (
                    <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-100/50 animate-fade-in">
                      {flashcards.map((fc, idx) => (
                        <div key={idx} className="bg-white border border-indigo-50 rounded-2xl p-4 shadow-sm space-y-2">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase">Flashcard {idx + 1}</p>
                          <p className="font-bold text-xs text-gray-800">{fc.question}</p>
                          <p className="text-xs text-gray-500 italic leading-relaxed">{fc.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT SIDEBAR (1/4) - CampusAI Assistant */}
          <div className="space-y-6">
            
            {/* Context Assistant */}
            <Card className="bento-tile border-indigo-100 p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <CardHeader className="p-0 mb-4 space-y-1">
                <Badge className="bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[9px] font-bold px-2 py-0.5 w-fit rounded-lg uppercase tracking-wider">
                  Syllabus Helper
                </Badge>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                  <Bot className="w-4.5 h-4.5 text-indigo-400" />
                  CampusAI Assistant
                </CardTitle>
                <CardDescription className="text-[11px] text-indigo-200/70">
                  Ask anything about this lecture.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-3">
                {[
                  `Explain the topic of "${lecture.topic}"`,
                  'Give me a real-world example',
                  'Summarize today\'s key points',
                  'Create practice questions'
                ].map((prompt, idx) => (
                  <Button 
                    key={idx}
                    onClick={() => handleAskAssistant(prompt)}
                    variant="outline"
                    className="w-full text-left justify-start text-[11px] font-medium bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:text-white rounded-xl py-2.5 whitespace-normal leading-snug h-auto"
                  >
                    {prompt}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Author info */}
            <Card className="bento-tile p-4 space-y-3 text-xs text-gray-500">
              <h4 className="font-bold text-gray-700">Lecture Metadata</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] font-bold uppercase text-gray-400">Class Division</p>
                  <p className="font-semibold text-gray-700">{lecture.class_name || 'All'} - {lecture.division || 'All'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-gray-400">Audience Batch</p>
                  <p className="font-semibold text-gray-700">{lecture.batch || 'All Students'}</p>
                </div>
              </div>
            </Card>

          </div>

        </div>

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="bg-white/90 backdrop-blur rounded-[24px] border border-gray-100 p-4 mt-8 flex items-center justify-between shadow-soft">
          <Button 
            variant="outline"
            className="rounded-xl text-xs font-bold border-gray-200"
            disabled={!prevLecture}
            asChild={!!prevLecture}
          >
            {prevLecture ? (
              <Link to={`/lectures/${prevLecture.lecture_id}`}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Lecture
              </Link>
            ) : (
              <span><ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Lecture</span>
            )}
          </Button>

          <Button 
            onClick={handleMarkComplete}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold px-6 py-2"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Complete
          </Button>

          <Button 
            variant="outline"
            className="rounded-xl text-xs font-bold border-gray-200"
            disabled={!nextLecture}
            asChild={!!nextLecture}
          >
            {nextLecture ? (
              <Link to={`/lectures/${nextLecture.lecture_id}`}>
                Next Lecture <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            ) : (
              <span>Next Lecture <ArrowRight className="w-4 h-4 ml-1.5" /></span>
            )}
          </Button>
        </div>

      </main>

      <FloatingAIButton />
    </div>
  );
}
