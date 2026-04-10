import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { AudioRecorder } from '../components/AudioRecorder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Mic,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  Play,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [newLecture, setNewLecture] = useState({ title: '', subject: '', topic: '', batch: 'All' });
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  useEffect(() => {
    fetchTeacherData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const createLecture = async () => {
    if (!newLecture.title || !newLecture.subject || !newLecture.topic) {
      toast.error('Please fill all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API}/lectures`, newLecture, { withCredentials: true });
      setSelectedLecture(response.data);
      setNewLecture({ title: '', subject: '', topic: '', batch: 'All' });
      toast.success('Lecture created! You can now record audio.');
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error('Failed to create lecture');
    } finally {
      setCreating(false);
    }
  };

  const handleRecordingComplete = async (audioBlob, duration) => {
    if (!selectedLecture) {
      toast.error('Please create a lecture first');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      // Upload audio
      await axios.post(
        `${API}/lectures/${selectedLecture.lecture_id}/audio`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Audio uploaded! Processing...');

      // Process lecture
      const processRes = await axios.post(
        `${API}/lectures/${selectedLecture.lecture_id}/process`,
        {},
        { withCredentials: true }
      );

      setSelectedLecture(processRes.data);
      fetchTeacherData();
      toast.success('Lecture processed successfully!');
    } catch (error) {
      console.error('Error processing lecture:', error);
      toast.error('Failed to process lecture');
    }
  };

  const generateQuizFromLecture = async (lectureId) => {
    setGeneratingQuiz(true);
    try {
      const lecture = lectures.find(l => l.lecture_id === lectureId);
      const response = await axios.post(
        `${API}/quizzes/generate`,
        {
          lecture_id: lectureId,
          topic: lecture?.topic || 'General',
          num_questions: 5,
        },
        { withCredentials: true }
      );
      setGeneratedQuestions(response.data.questions);
      toast.success('Quiz questions generated!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const saveQuiz = async () => {
    if (!selectedLecture || generatedQuestions.length === 0) {
      toast.error('No questions to save');
      return;
    }

    try {
      await axios.post(
        `${API}/quizzes`,
        {
          lecture_id: selectedLecture.lecture_id,
          title: `Quiz: ${selectedLecture.title}`,
          subject: selectedLecture.subject,
          topic: selectedLecture.topic,
          questions: generatedQuestions,
          time_limit: 15,
        },
        { withCredentials: true }
      );
      toast.success('Quiz saved successfully!');
      setShowQuizDialog(false);
      setGeneratedQuestions([]);
      fetchTeacherData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    }
  };

  // Chart data for student performance overview
  const performanceData = [
    { name: 'Week 1', avgScore: 72 },
    { name: 'Week 2', avgScore: 75 },
    { name: 'Week 3', avgScore: 78 },
    { name: 'Week 4', avgScore: 82 },
    { name: 'Week 5', avgScore: 85 },
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
    <div className="min-h-screen bg-background" data-testid="teacher-dashboard">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage lectures, create quizzes, and track student progress</p>
          </div>
          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-full" data-testid="new-lecture-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create & Record Lecture</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {!selectedLecture ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Lecture Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Introduction to Arrays"
                          value={newLecture.title}
                          onChange={e => setNewLecture({ ...newLecture, title: e.target.value })}
                          data-testid="lecture-title-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Computer Science"
                          value={newLecture.subject}
                          onChange={e => setNewLecture({ ...newLecture, subject: e.target.value })}
                          data-testid="lecture-subject-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="topic">Topic</Label>
                        <Input
                          id="topic"
                          placeholder="e.g., Data Structures"
                          value={newLecture.topic}
                          onChange={e => setNewLecture({ ...newLecture, topic: e.target.value })}
                          data-testid="lecture-topic-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="batch">Batch</Label>
                        <Select
                          value={newLecture.batch}
                          onValueChange={val => setNewLecture({ ...newLecture, batch: val })}
                        >
                          <SelectTrigger data-testid="lecture-batch-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Students</SelectItem>
                            <SelectItem value="CS-2025">CS-2025</SelectItem>
                            <SelectItem value="CS-2024">CS-2024</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={createLecture} disabled={creating} className="w-full" data-testid="create-lecture-btn">
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Lecture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent rounded-lg">
                      <h4 className="font-medium">{selectedLecture.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedLecture.subject} • {selectedLecture.topic}
                      </p>
                      <Badge className="mt-2">{selectedLecture.status}</Badge>
                    </div>
                    {selectedLecture.status === 'pending' && (
                      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                    )}
                    {selectedLecture.status === 'completed' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-green-700 dark:text-green-400">Lecture processed successfully!</span>
                        </div>
                        <Button
                          onClick={() => navigate(`/lectures/${selectedLecture.lecture_id}`)}
                          variant="outline"
                          className="w-full"
                        >
                          View Lecture Notes
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Lectures', value: lectures.length, icon: BookOpen, color: 'primary' },
            { label: 'Quizzes Created', value: quizzes.length, icon: Award, color: 'secondary' },
            { label: 'Students', value: 45, icon: Users, color: 'amber-500' },
            { label: 'Avg. Score', value: '78%', icon: TrendingUp, color: 'green-500' },
          ].map((stat, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="lectures" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lectures" data-testid="tab-lectures">Lectures</TabsTrigger>
            <TabsTrigger value="quizzes" data-testid="tab-quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="lectures">
            <Card>
              <CardHeader>
                <CardTitle>Your Lectures</CardTitle>
                <CardDescription>Manage and view lecture content</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {lectures.length > 0 ? lectures.map(lecture => (
                      <div
                        key={lecture.lecture_id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                        data-testid={`lecture-row-${lecture.lecture_id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{lecture.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {lecture.subject} • {lecture.topic}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={lecture.status === 'completed' ? 'default' : 'outline'}>
                            {lecture.status}
                          </Badge>
                          {lecture.status === 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/lectures/${lecture.lecture_id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLecture(lecture);
                                  setShowQuizDialog(true);
                                  generateQuizFromLecture(lecture.lecture_id);
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Generate Quiz
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No lectures yet. Create your first lecture!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Quizzes</CardTitle>
                <CardDescription>View and manage quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {quizzes.length > 0 ? quizzes.map(quiz => (
                      <div
                        key={quiz.quiz_id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-secondary/10">
                            <Award className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {quiz.questions?.length || 0} questions • {quiz.time_limit} min
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/quizzes/${quiz.quiz_id}`)}>
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No quizzes yet. Generate one from a lecture!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>Average student scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quiz Generation Dialog */}
        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Generated Quiz</DialogTitle>
            </DialogHeader>
            {generatingQuiz ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating quiz questions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, j) => (
                        <p
                          key={j}
                          className={`text-sm p-2 rounded ${j === q.correct_answer ? 'bg-green-500/10 text-green-700 dark:text-green-400' : ''}`}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                        </p>
                      ))}
                    </div>
                    <Badge variant="outline" className="mt-2">{q.difficulty}</Badge>
                  </div>
                ))}
                {generatedQuestions.length > 0 && (
                  <Button onClick={saveQuiz} className="w-full" data-testid="save-quiz-btn">
                    <Send className="w-4 h-4 mr-2" />
                    Save Quiz
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
