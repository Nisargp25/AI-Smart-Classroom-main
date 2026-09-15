import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

import { Navbar } from '../components/Navbar';
import { AudioRecorder } from '../components/AudioRecorder';
import AIFloatingAssistant from '../components/ai-dashboard/teacher/AIFloatingAssistant';
import API from '../lib/api';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import { ScrollArea } from '../components/ui/scroll-area';

import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import { toast } from 'sonner';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* =========================================================
   CONSTANTS
========================================================= */

const emptyClassroomOptions = {
  classes: [],
  divisions: [],
  batches: [],
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString();
}

function relativeTime(value) {
  if (!value) return 'Time unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );

  if (minutes < 1) return 'Just now';

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return days < 30
    ? `${days}d ago`
    : formatDate(value);
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
      aria-hidden="true"
    />
  );
}

function EmptyState({
  icon: Icon,
  title,
  action,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
      <Icon
        className="mb-3 h-8 w-8 text-gray-300"
        aria-hidden="true"
      />

      <p className="text-sm font-semibold text-gray-700">
        {title}
      </p>

      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAction}
        >
          <Plus className="h-4 w-4" />
          {action}
        </Button>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  color = 'text-indigo-600',
  bgColor = 'bg-indigo-50',
  borderColor = 'border-gray-100',
}) {
  return (
    <Card className={`bento-tile rounded-[18px] border ${borderColor} bg-white/90 shadow-soft transition-shadow hover:shadow-md`}>
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className={`rounded-2xl p-2.5 ${bgColor} ${color}`}>
            <Icon className="h-5 w-5" />
          </span>

          <ArrowUpRight className="h-4 w-4 text-gray-300" />
        </div>

        <p className="text-2xl font-extrabold tracking-tight text-gray-800">
          {value}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-700">
          {label}
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-400">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <Button
      variant="outline"
      className="h-auto min-h-14 justify-start rounded-xl border-slate-200 bg-white px-4 py-3 text-left hover:border-indigo-200 hover:bg-indigo-50"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-indigo-600" />
      {label}
    </Button>
  );
}

function LectureCard({
  lecture,
  onView,
}) {
  return (
    <Card className="rounded-[18px] border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <FileText className="h-5 w-5" />
          </span>

          <Badge
            variant={
              lecture.status === 'completed'
                ? 'default'
                : 'outline'
            }
          >
            {lecture.status || 'Status Unavailable'}
          </Badge>
        </div>

        <h3 className="mt-5 line-clamp-2 text-lg font-extrabold text-gray-800">
          {lecture.title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {lecture.subject || 'Subject Unavailable'}
        </p>

        <p className="mt-4 text-xs text-gray-400">
          {lecture.topic || 'Topic Unavailable'} ·{' '}
          {formatDate(
            lecture.created_at || lecture.createdAt
          )}
        </p>

        <Button
          variant="outline"
          className="mt-5 w-full rounded-xl"
          onClick={onView}
        >
          View Lecture
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ContentList({
  title,
  icon: Icon,
  items,
  empty,
  onView,
  onGenerate,
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-600" />
        <h3 className="font-semibold">
          {title}
        </h3>
      </div>

      <ScrollArea className="h-72">
        <div className="space-y-2 pr-2">
          {items.length ? (
            items.map((item) => (
              <div
                key={
                  item.lecture_id ||
                  item.quiz_id
                }
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.title}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {item.topic ||
                      `${item.questions?.length || 0} questions`}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(item)}
                  >
                    View
                  </Button>

                  {onGenerate &&
                    item.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onGenerate(item)
                        }
                        aria-label={`Generate quiz from ${item.title}`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">
              {empty}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/* =========================================================
   MAIN TEACHER DASHBOARD
========================================================= */

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [classroomOptions, setClassroomOptions] =
    useState(emptyClassroomOptions);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [creating, setCreating] = useState(false);

  const [selectedLecture, setSelectedLecture] =
    useState(null);

  const [showRecordDialog, setShowRecordDialog] =
    useState(false);

  const [showQuizDialog, setShowQuizDialog] =
    useState(false);

  const [generatingQuiz, setGeneratingQuiz] =
    useState(false);

  const [generatedQuestions, setGeneratedQuestions] =
    useState([]);

  const [numQuestions, setNumQuestions] =
    useState(10);

  const [numOptions, setNumOptions] =
    useState(4);

  const [newLecture, setNewLecture] = useState({
    title: '',
    subject: '',
    topic: '',
    batch: '',
    batch_id: null,
    class_name: user?.class_name || '',
    division: user?.division || '',
  });

  /* -------------------------------------------------------
     EFFECTS
  ------------------------------------------------------- */

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    setNewLecture((previous) => ({
      ...previous,
      class_name: user?.class_name || '',
      division: user?.division || '',
    }));
  }, [
    user?.class_name,
    user?.division,
  ]);

  /* -------------------------------------------------------
     API: FETCH DASHBOARD DATA
  ------------------------------------------------------- */

  async function fetchTeacherData() {
    setLoadError(false);

    try {
      const [
        lecturesResponse,
        quizzesResponse,
        classroomResponse,
      ] = await Promise.all([
        axios.get(
          `${API}/lectures?limit=100`,
          { withCredentials: true }
        ),

        axios.get(
          `${API}/quizzes`,
          { withCredentials: true }
        ),

        axios.get(
          `${API}/classroom/options`,
          { withCredentials: true }
        ),
      ]);

      setLectures(
        lecturesResponse.data || []
      );

      setQuizzes(
        quizzesResponse.data || []
      );

      setClassroomOptions(
        classroomResponse.data ||
          emptyClassroomOptions
      );

      try {
        const analyticsResponse = await axios.get(
          `${API}/teacher/analytics`,
          { withCredentials: true }
        );
        setAnalytics(analyticsResponse.data || null);
      } catch (analyticsError) {
        console.error('Error fetching teacher analytics:', analyticsError);
        setAnalytics(null);
      }
    } catch (error) {
      console.error(
        'Error fetching teacher data:',
        error
      );

      setLoadError(true);

      toast.error(
        'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     API: CREATE LECTURE
  ------------------------------------------------------- */

  async function createLecture() {
    if (
      !newLecture.title ||
      !newLecture.subject ||
      !newLecture.topic
    ) {
      toast.error(
        'Please fill all required fields'
      );
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post(
        `${API}/lectures`,
        newLecture,
        { withCredentials: true }
      );

      setSelectedLecture(response.data);

      setNewLecture({
        title: '',
        subject: '',
        topic: '',
        batch: '',
        batch_id: null,
        class_name: user?.class_name || '',
        division: user?.division || '',
      });

      toast.success(
        'Lecture created. You can now record it.'
      );

      await fetchTeacherData();
    } catch (error) {
      console.error(
        'Error creating lecture:',
        error
      );

      toast.error(
        'Failed to create lecture'
      );
    } finally {
      setCreating(false);
    }
  }

  /* -------------------------------------------------------
     API: PROCESS LECTURE RECORDING
  ------------------------------------------------------- */

  async function handleRecordingComplete(
    audioBlob
  ) {
    if (!selectedLecture) {
      toast.error(
        'Please create a lecture first'
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      'audio',
      audioBlob,
      'recording.webm'
    );

    try {
      await axios.post(
        `${API}/lectures/${selectedLecture.lecture_id}/audio`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      const processResponse =
        await axios.post(
          `${API}/lectures/${selectedLecture.lecture_id}/process`,
          {},
          { withCredentials: true }
        );

      setSelectedLecture(
        processResponse.data
      );

      await fetchTeacherData();

      toast.success(
        'Lecture processed successfully.'
      );
    } catch (error) {
      console.error(
        'Error processing lecture:',
        error
      );

      toast.error(
        'Failed to process lecture'
      );
    }
  }

  /* -------------------------------------------------------
     API: GENERATE QUIZ
  ------------------------------------------------------- */

  async function generateQuizFromLecture(
    lectureId
  ) {
    setGeneratingQuiz(true);

    try {
      const lecture = lectures.find(
        (item) =>
          item.lecture_id === lectureId
      );

      const response = await axios.post(
        `${API}/quizzes/generate`,
        {
          lecture_id: lectureId,
          topic: lecture?.topic || '',
          num_questions: numQuestions,
          num_options: numOptions,
        },
        { withCredentials: true }
      );

      setGeneratedQuestions(
        response.data.questions || []
      );

      toast.success(
        'Quiz questions generated.'
      );
    } catch (error) {
      console.error(
        'Error generating quiz:',
        error
      );

      toast.error(
        'Failed to generate quiz'
      );
    } finally {
      setGeneratingQuiz(false);
    }
  }

  /* -------------------------------------------------------
     QUIZ DIALOG
  ------------------------------------------------------- */

  function openQuizGenerator(lecture) {
    if (!lecture) {
      toast.info(
        'Create and process a lecture before generating a quiz'
      );
      return;
    }

    setSelectedLecture(lecture);
    setGeneratedQuestions([]);
    setShowQuizDialog(true);
  }

  /* -------------------------------------------------------
     QUIZ EDITING
  ------------------------------------------------------- */

  function updateQuestion(
    index,
    field,
    value
  ) {
    setGeneratedQuestions(
      (previous) =>
        previous.map(
          (question, questionIndex) =>
            questionIndex === index
              ? {
                  ...question,
                  [field]: value,
                }
              : question
        )
    );
  }

  function updateOption(
    questionIndex,
    optionIndex,
    value
  ) {
    setGeneratedQuestions(
      (previous) =>
        previous.map(
          (question, index) => {
            if (
              index !== questionIndex
            ) {
              return question;
            }

            const options = [
              ...question.options,
            ];

            options[optionIndex] = value;

            return {
              ...question,
              options,
            };
          }
        )
    );
  }

  /* -------------------------------------------------------
     API: SAVE QUIZ
  ------------------------------------------------------- */

  async function saveQuiz() {
    if (
      !selectedLecture ||
      generatedQuestions.length === 0
    ) {
      toast.error(
        'No questions to save'
      );
      return;
    }

    try {
      await axios.post(
        `${API}/quizzes`,
        {
          lecture_id:
            selectedLecture.lecture_id,

          title: `Quiz: ${selectedLecture.title}`,

          subject:
            selectedLecture.subject,

          topic:
            selectedLecture.topic,

          questions:
            generatedQuestions,

          time_limit: 15,
        },
        { withCredentials: true }
      );

      toast.success(
        'Quiz saved successfully.'
      );

      setShowQuizDialog(false);
      setGeneratedQuestions([]);

      await fetchTeacherData();
    } catch (error) {
      console.error(
        'Error saving quiz:',
        error
      );

      toast.error(
        'Failed to save quiz'
      );
    }
  }

  /* -------------------------------------------------------
     DERIVED DATA
  ------------------------------------------------------- */

  const activities = [
    ...lectures.map((lecture) => ({
      type: 'Lecture created',
      title: lecture.title,
      date:
        lecture.created_at ||
        lecture.createdAt,
      icon: BookOpen,
    })),

    ...quizzes.map((quiz) => ({
      type: 'Quiz created',
      title: quiz.title,
      date:
        quiz.created_at ||
        quiz.createdAt,
      icon: Award,
    })),
  ]
    .filter((item) => item.date)
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    )
    .slice(0, 4);

  const firstProcessedLecture =
    lectures.find(
      (lecture) =>
        lecture.status === 'completed'
    );

  /* -------------------------------------------------------
     LOADING SCREEN
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen ai-dashboard-bg">
        <Navbar />

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-28" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <Skeleton
                  key={item}
                  className="h-32"
                />
              )
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD UI
  ======================================================= */

  return (
    <div
      className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-14 text-gray-900"
      data-testid="teacher-dashboard"
    >
      <Navbar />

      <div className="pointer-events-none absolute left-8 top-24 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-[28rem] h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

      <main className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100/60 bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-8 shadow-soft sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/60 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-purple-200/30 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700"><Sparkles className="h-3.5 w-3.5" />Teacher Dashboard</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />AI Status: Active</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Good morning, {user?.name || user?.username || 'Teacher'}</h1>

              <p className="max-w-xl text-base leading-relaxed text-gray-600">Review your lectures, quizzes, and classroom activity from one focused workspace.</p>
            </div>

            <div className="relative flex shrink-0 items-center justify-center p-4">
              <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-400/10 blur-2xl" />
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-2xl">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white p-4 text-center">
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Activity className="h-6 w-6" /></div>
                  <p className="text-2xl font-black tracking-tight text-gray-900">{analytics?.average_score == null ? '--' : `${Math.round(analytics.average_score)}%`}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Score</p>
                </div>
              </div>
              <div className="absolute -left-1 -top-1 flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-white/95 px-3 py-2 shadow-md"><Users className="h-4 w-4 text-indigo-600" /><span className="text-xs font-bold text-gray-800">{analytics?.student_count ?? '--'} Students</span></div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-white/95 px-3 py-2 shadow-md"><BookOpen className="h-4 w-4 text-amber-500" /><span className="text-xs font-bold text-gray-800">{analytics?.lecture_count ?? lectures.length} Lectures</span></div>
            </div>

            <Dialog
            open={showRecordDialog}
            onOpenChange={
              setShowRecordDialog
            }
          >
            <DialogTrigger asChild>
              <Button
                className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-indigo-700"
                data-testid="new-lecture-btn"
              >
                <Plus className="h-4 w-4" />
                Create Lecture
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Create &amp; Record Lecture
                </DialogTitle>
              </DialogHeader>

              <LectureForm
                newLecture={newLecture}
                setNewLecture={
                  setNewLecture
                }
                classroomOptions={
                  classroomOptions
                }
                creating={creating}
                createLecture={
                  createLecture
                }
                selectedLecture={
                  selectedLecture
                }
                handleRecordingComplete={
                  handleRecordingComplete
                }
                navigate={navigate}
              />
            </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {loadError && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>
              Failed to load dashboard data.
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTeacherData}
            >
              Retry
            </Button>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={Users}
            label="Students"
            value={analytics?.student_count ?? 'Not Available'}
            detail="Students in your class"
            color="text-cyan-600"
            bgColor="bg-cyan-50"
            borderColor="border-cyan-100"
          />

          <StatCard
            icon={BookOpen}
            label="Lectures"
            value={analytics?.lecture_count ?? lectures.length}
            detail="Created by you"
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
          />

          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={analytics?.average_score == null ? 'Not Available' : `${Math.round(analytics.average_score)}%`}
            detail={analytics?.average_score == null ? 'No class score data available' : 'Overall class average'}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          />

          <StatCard
            icon={Activity}
            label="Class Level"
            value={analytics?.class_level || 'Not Available'}
            detail={analytics?.class_level ? 'Based on quiz performance' : 'Requires performance data'}
            color="text-orange-600"
            bgColor="bg-orange-50"
            borderColor="border-orange-100"
          />

        </section>

        {/* =================================================
            PERFORMANCE + ACTIVITY
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">

          {/* CLASS PERFORMANCE */}

          <Card className="rounded-[18px] border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Class Performance
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Average scores from recent quizzes.
                  </CardDescription>
                </div>

                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
            </CardHeader>

            <CardContent>
              {analytics?.performance_trend?.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.performance_trend} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={value => value.length > 14 ? `${value.slice(0, 14)}...` : value} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={value => [`${value}%`, 'Average Score']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={TrendingUp} title="No performance data available." action="Create Quiz" onAction={() => openQuizGenerator(firstProcessedLecture)} />
              )}
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY */}

          <Card className="rounded-[18px] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Recent Activity
              </CardTitle>

              <CardDescription className="mt-1">
                Latest updates from your classroom.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activities.length ? (
                <div className="space-y-2">
                  {activities.map(
                    (
                      activity,
                      index
                    ) => (
                      <div
                        key={`${activity.type}-${activity.date}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                      >
                        <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                          <activity.icon className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {activity.type}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {activity.title}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {relativeTime(
                            activity.date
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No recent classroom activity."
                />
              )}
            </CardContent>
          </Card>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Actions
            </p>

            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <ActionButton
              icon={Plus}
              label="Create Lecture"
              onClick={() =>
                setShowRecordDialog(true)
              }
            />

            <ActionButton
              icon={Award}
              label="Create Quiz"
              onClick={() =>
                openQuizGenerator(
                  firstProcessedLecture
                )
              }
            />

            <ActionButton
              icon={FileText}
              label="Add Note"
              onClick={() =>
                toast.info(
                  'Notes are not available yet.'
                )
              }
            />

            <ActionButton
              icon={BarChart3}
              label="View Analytics"
              onClick={() => navigate('/teacher/analytics')}
            />

          </div>
        </section>

        {/* =================================================
            RECENT LECTURES
        ================================================= */}

        <section>
          <div className="mb-3 flex items-end justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Library
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                My Lectures
              </h2>
            </div>

            <Button
              variant="ghost"
              onClick={() =>
                navigate('/lectures')
              }
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Button>

          </div>

          {lectures.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lectures
                .slice(0, 3)
                .map((lecture) => (
                  <LectureCard
                    key={
                      lecture.lecture_id
                    }
                    lecture={lecture}
                    onView={() =>
                      navigate(
                        `/lectures/${lecture.lecture_id}`
                      )
                    }
                  />
                ))}
            </div>
          ) : (
            <Card className="rounded-[18px] border-slate-200">
              <CardContent className="pt-6">
                <EmptyState
                  icon={BookOpen}
                  title="No lectures available."
                  action="Create Lecture"
                  onAction={() =>
                    setShowRecordDialog(
                      true
                    )
                  }
                />
              </CardContent>
            </Card>
          )}
        </section>

        {/* =================================================
            ALL CONTENT
        ================================================= */}

        <Card className="rounded-[18px] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              All Workspace Content
            </CardTitle>

            <CardDescription>
              Manage your lectures and quizzes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">

              <ContentList
                title="Lectures"
                icon={FileText}
                items={lectures}
                empty="No lectures available."
                onView={(item) =>
                  navigate(
                    `/lectures/${item.lecture_id}`
                  )
                }
                onGenerate={(item) =>
                  openQuizGenerator(item)
                }
              />

              <ContentList
                title="Quizzes"
                icon={Award}
                items={quizzes}
                empty="No quizzes available."
                onView={(item) =>
                  navigate(
                    `/quizzes/${item.quiz_id}`
                  )
                }
              />

            </div>
          </CardContent>
        </Card>

      </main>

      {/* ===================================================
          QUIZ GENERATOR
      =================================================== */}

      <QuizDialog
        showQuizDialog={
          showQuizDialog
        }
        setShowQuizDialog={
          setShowQuizDialog
        }
        selectedLecture={
          selectedLecture
        }
        generatingQuiz={
          generatingQuiz
        }
        generatedQuestions={
          generatedQuestions
        }
        numQuestions={
          numQuestions
        }
        setNumQuestions={
          setNumQuestions
        }
        numOptions={
          numOptions
        }
        setNumOptions={
          setNumOptions
        }
        generateQuizFromLecture={
          generateQuizFromLecture
        }
        updateQuestion={
          updateQuestion
        }
        updateOption={
          updateOption
        }
        setGeneratedQuestions={
          setGeneratedQuestions
        }
        saveQuiz={saveQuiz}
      />
      <AIFloatingAssistant />
    </div>
  );
}

/* =========================================================
   LECTURE FORM
========================================================= */

function LectureForm({
  newLecture,
  setNewLecture,
  classroomOptions,
  creating,
  createLecture,
  selectedLecture,
  handleRecordingComplete,
  navigate,
}) {
  if (!selectedLecture) {
    return (
      <div className="space-y-4">

        {/* TITLE + SUBJECT */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <Label htmlFor="title">
              Lecture Title
            </Label>

            <Input
              id="title"
              value={newLecture.title}
              onChange={(event) =>
                setNewLecture({
                  ...newLecture,
                  title:
                    event.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="subject">
              Subject
            </Label>

            <Input
              id="subject"
              value={newLecture.subject}
              onChange={(event) =>
                setNewLecture({
                  ...newLecture,
                  subject:
                    event.target.value,
                })
              }
            />
          </div>

        </div>

        {/* TOPIC + BATCH */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <Label htmlFor="topic">
              Topic
            </Label>

            <Input
              id="topic"
              value={newLecture.topic}
              onChange={(event) =>
                setNewLecture({
                  ...newLecture,
                  topic:
                    event.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="batch">
              Batch
            </Label>

            <Select
              value={
                newLecture.batch_id ||
                'none'
              }
              onValueChange={(batchId) => {
                const batch =
                  classroomOptions.batches.find(
                    (item) =>
                      item.id ===
                      batchId
                  );

                setNewLecture({
                  ...newLecture,

                  batch_id:
                    batchId === 'none'
                      ? null
                      : batchId,

                  batch:
                    batchId === 'none'
                      ? ''
                      : batch?.name || '',
                });
              }}
            >
              <SelectTrigger id="batch">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">
                  No Batch Selected
                </SelectItem>

                {classroomOptions.batches.map(
                  (batch) => (
                    <SelectItem
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* CLASS + DIVISION */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <Label htmlFor="class_name">
              Class
            </Label>

            <Input
              id="class_name"
              value={
                newLecture.class_name
              }
              readOnly
            />
          </div>

          <div>
            <Label htmlFor="division">
              Division
            </Label>

            <Input
              id="division"
              value={
                newLecture.division
              }
              readOnly
            />
          </div>

        </div>

        <Button
          onClick={createLecture}
          disabled={creating}
          className="w-full"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          Create Lecture
        </Button>

      </div>
    );
  }

  /* =======================================================
     RECORDING STATE
  ======================================================= */

  return (
    <div className="space-y-4">

      <div className="rounded-xl bg-slate-50 p-4">
        <h4 className="font-semibold">
          {selectedLecture.title}
        </h4>

        <p className="text-sm text-gray-500">
          {selectedLecture.subject} ·{' '}
          {selectedLecture.topic}
        </p>

        <Badge className="mt-2">
          {selectedLecture.status}
        </Badge>
      </div>

      {selectedLecture.status ===
        'pending' && (
        <AudioRecorder
          onRecordingComplete={
            handleRecordingComplete
          }
        />
      )}

      {selectedLecture.status ===
        'completed' && (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            Lecture processed successfully.
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(
                `/lectures/${selectedLecture.lecture_id}`
              )
            }
          >
            View Notes
          </Button>
        </>
      )}

    </div>
  );
}

/* =========================================================
   QUIZ DIALOG
========================================================= */

function QuizDialog({
  showQuizDialog,
  setShowQuizDialog,
  selectedLecture,
  generatingQuiz,
  generatedQuestions,
  numQuestions,
  setNumQuestions,
  numOptions,
  setNumOptions,
  generateQuizFromLecture,
  updateQuestion,
  updateOption,
  setGeneratedQuestions,
  saveQuiz,
}) {
  return (
    <Dialog
      open={showQuizDialog}
      onOpenChange={
        setShowQuizDialog
      }
    >
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">

        <DialogHeader>
          <DialogTitle>
            AI Generated Quiz
          </DialogTitle>
        </DialogHeader>

        {/* QUIZ SETTINGS */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div>
            <Label>
              Number of Questions
            </Label>

            <Select
              value={String(
                numQuestions
              )}
              onValueChange={(value) =>
                setNumQuestions(
                  Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {[5, 10, 15, 20, 30, 40, 50].map(
                  (value) => (
                    <SelectItem
                      key={value}
                      value={String(value)}
                    >
                      {value} questions
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Options per Question
            </Label>

            <Select
              value={String(
                numOptions
              )}
              onValueChange={(value) =>
                setNumOptions(
                  Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {[2, 3, 4, 5].map(
                  (value) => (
                    <SelectItem
                      key={value}
                      value={String(value)}
                    >
                      {value} options
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* GENERATING */}

        {generatingQuiz ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-indigo-600" />

            <p className="text-sm text-gray-500">
              Generating quiz questions...
            </p>
          </div>
        ) : (
          <>
            {/* GENERATE BUTTON */}

            {!generatedQuestions.length && (
              <Button
                className="w-full"
                disabled={!selectedLecture}
                onClick={() =>
                  generateQuizFromLecture(
                    selectedLecture.lecture_id
                  )
                }
              >
                <Sparkles className="h-4 w-4" />
                Generate Quiz with AI
              </Button>
            )}

            {/* QUESTIONS */}

            <div className="space-y-4">
              {generatedQuestions.map(
                (
                  question,
                  questionIndex
                ) => (
                  <div
                    key={questionIndex}
                    className="space-y-3 rounded-xl border border-slate-200 p-4"
                  >

                    {/* QUESTION */}

                    <div className="flex gap-2">

                      <Input
                        value={
                          question.question
                        }
                        onChange={(event) =>
                          updateQuestion(
                            questionIndex,
                            'question',
                            event.target.value
                          )
                        }
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setGeneratedQuestions(
                            (previous) =>
                              previous.filter(
                                (_, index) =>
                                  index !==
                                  questionIndex
                              )
                          )
                        }
                        aria-label="Remove question"
                      >
                        <X className="h-4 w-4" />
                      </Button>

                    </div>

                    {/* OPTIONS */}

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >

                          <button
                            type="button"
                            className={`h-7 w-7 shrink-0 rounded-full border text-xs font-bold ${
                              question.correct_answer ===
                              optionIndex
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300'
                            }`}
                            onClick={() =>
                              updateQuestion(
                                questionIndex,
                                'correct_answer',
                                optionIndex
                              )
                            }
                            aria-label={`Mark option ${optionIndex + 1} correct`}
                          >
                            {String.fromCharCode(
                              65 +
                                optionIndex
                            )}
                          </button>

                          <Input
                            value={option}
                            onChange={(event) =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                event.target.value
                              )
                            }
                          />

                        </div>
                      )
                    )}

                  </div>
                )
              )}
            </div>

            {/* QUIZ ACTIONS */}

            {generatedQuestions.length >
              0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    setGeneratedQuestions(
                      (previous) => [
                        ...previous,
                        {
                          question: '',
                          options:
                            Array.from(
                              {
                                length:
                                  numOptions,
                              },
                              () => ''
                            ),
                          correct_answer: 0,
                          difficulty:
                            'medium',
                          explanation: '',
                        },
                      ]
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>

                <Button
                  className="w-full"
                  onClick={saveQuiz}
                >
                  <Send className="h-4 w-4" />
                  Save Quiz
                </Button>
              </>
            )}
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}

