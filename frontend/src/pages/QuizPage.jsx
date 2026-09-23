import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Brain,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/quizzes/${quizId}`, { withCredentials: true });
      setQuiz(response.data);
      setTimeLeft((response.data?.time_limit || 20) * 60);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await axios.post(
        `${API}/quizzes/${quizId}/submit`,
        { answers, time_taken: timeTaken },
        { withCredentials: true }
      );
      
      setResult(response.data);
      setSubmitted(true);
      
      // Register completed quiz in local storage
      const completed = JSON.parse(localStorage.getItem('completed_quizzes') || '[]');
      if (!completed.includes(quizId)) {
        completed.push(quizId);
        localStorage.setItem('completed_quizzes', JSON.stringify(completed));
      }

      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  }, [answers, quizId, startTime, submitted]);

  // Timer effect
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !quiz) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit, timeLeft, submitted, quiz]);

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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Quiz not found</p>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Format timer helper
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ============ RESULTS / REVIEW SCREEN ============
  if (submitted && result) {
    const accuracy = Math.round(result.percentage);
    const scoreStr = `${result.score}/${result.total}`;
    
    // Dynamic AI Analysis copywriting
    const isPassing = accuracy >= 70;
    const feedbackMsg = isPassing
      ? `Superb job! Your understanding of ${quiz.topic} is strong, showcasing excellent problem-solving accuracy.`
      : `Good effort! Some conceptual gaps exist in ${quiz.topic}. We suggest revising weak nodes and retrying.`;

    const strongTopics = accuracy >= 70 ? [quiz.topic, quiz.subject] : [quiz.subject];
    const weakTopics = accuracy < 70 ? [quiz.topic] : [];
    
    return (
      <div className="min-h-screen ai-dashboard-bg pb-12" data-testid="quiz-results">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
          
          {/* Results Summary Card */}
          <Card className="bento-tile p-8 border-gray-100 shadow-soft text-center bg-white/90 backdrop-blur">
            <CardContent className="p-0">
              <div className="mb-4">
                {isPassing ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-100">
                    <Trophy className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto ring-4 ring-amber-100">
                    <Award className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quiz Submitted!</h2>
              <p className="text-sm text-gray-500 mt-1">{feedbackMsg}</p>

              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 text-center">
                  <p className="text-3xl font-black text-indigo-600 tracking-tight">{scoreStr}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Score</p>
                </div>
                <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100/30 text-center">
                  <p className="text-3xl font-black text-cyan-600 tracking-tight">{accuracy}%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Accuracy</p>
                </div>
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/30 text-center">
                  <p className="text-3xl font-black text-purple-600 tracking-tight">
                    {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Time Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CampusAI Results Analysis Card */}
          <Card className="bento-tile p-6 border-indigo-100 shadow-lg bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-md font-bold flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-indigo-400" />
                CampusAI Analysis
              </CardTitle>
              <CardDescription className="text-xs text-indigo-200/70">
                Concepts mapping & study path recommendations based on accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 grid sm:grid-cols-3 gap-4 text-xs">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px]">Strong Topics</p>
                <div className="flex flex-wrap gap-1">
                  {strongTopics.map((t, idx) => (
                    <Badge key={idx} className="bg-emerald-500/20 text-emerald-300 border-none rounded-lg text-[9px] font-semibold px-2 py-0.5">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-amber-400 uppercase tracking-wider text-[9px]">Needs Improvement</p>
                <div className="flex flex-wrap gap-1">
                  {weakTopics.length > 0 ? weakTopics.map((t, idx) => (
                    <Badge key={idx} className="bg-amber-500/20 text-amber-300 border-none rounded-lg text-[9px] font-semibold px-2 py-0.5">
                      {t}
                    </Badge>
                  )) : (
                    <span className="text-[10px] text-gray-400">None! All concepts above threshold.</span>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-indigo-300 uppercase tracking-wider text-[9px]">Recommended Practice</p>
                <p className="text-[11px] text-indigo-200/90 leading-relaxed font-medium">
                  {isPassing
                    ? `Explore ${quiz.topic} Coding Practice Problems`
                    : `Revise ${quiz.topic} Lecture Notes & summaries`}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Question Answers Review list */}
          <Card className="bento-tile p-6 border-gray-100 shadow-soft bg-white/95">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-md font-bold text-gray-800">Review Answers</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {questions.map((q, i) => {
                const userAnswer = answers[q.question_id];
                const isCorrect = userAnswer === q.correct_answer;
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${
                    isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'
                  }`}>
                    <div className="flex items-start gap-2.5 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <p className="font-bold text-xs text-gray-800 leading-normal">{q.question}</p>
                    </div>
                    <div className="text-[11px] ml-7 space-y-1">
                      <p className="text-gray-500 font-medium">
                        Your answer: <span className="text-gray-700 font-bold">{q.options[userAnswer] || 'Not answered'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700 font-bold">
                          Correct: {q.options[q.correct_answer]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="rounded-xl text-xs font-bold border-gray-200" onClick={() => navigate('/quizzes')} data-testid="back-to-quizzes-btn">
              Back to Quizzes
            </Button>
            <Button 
              onClick={() => {
                if (weakTopics.length > 0) {
                  navigate('/coding');
                } else {
                  navigate('/dashboard');
                }
              }} 
              className="rounded-xl text-xs font-bold bg-indigo-600 text-white" 
              data-testid="go-dashboard-btn">
              {weakTopics.length > 0 ? 'Practice Weak Topics' : 'Go to Dashboard'}
            </Button>
          </div>

        </main>
      </div>
    );
  }

  // ============ ACTIVE QUIZ INTERFACE ============
  return (
    <div className="min-h-screen ai-dashboard-bg pb-12" data-testid="quiz-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Quiz stats banner */}
        <Card className="bento-tile p-5 border-gray-100 shadow-soft bg-white/90 backdrop-blur animate-fade-in">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-sm text-gray-800">{quiz.title}</h2>
              <Badge className="bg-indigo-50 border-indigo-100/50 text-indigo-600 text-[9px] font-bold uppercase rounded-lg px-2">
                {quiz.topic}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span className={`flex items-center gap-1 font-bold ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-indigo-600'}`}>
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeLeft)}
              </span>
            </div>
            <Progress value={progress} className="mt-3.5 h-1.5" indicatorClassName="bg-indigo-600" />
          </CardContent>
        </Card>

        {/* Question options */}
        <Card className="bento-tile p-6 border-gray-100 shadow-soft bg-white/90 animate-fade-in" data-testid="question-card">
          <CardContent className="p-0 space-y-6">
            <div>
              <Badge variant="outline" className="text-[9px] font-bold uppercase border-indigo-100 text-indigo-600 rounded-lg px-2 mb-3">
                {currentQ?.difficulty || 'medium'}
              </Badge>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">{currentQ?.question}</h3>
            </div>

            <RadioGroup
              value={answers[currentQ?.question_id]?.toString()}
              onValueChange={(val) => handleAnswer(currentQ?.question_id, parseInt(val))}
              className="space-y-3"
            >
              {currentQ?.options.map((option, i) => {
                const isSelected = answers[currentQ?.question_id] === i;
                return (
                  <div
                    key={i}
                    onClick={() => handleAnswer(currentQ?.question_id, i)}
                    className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-gray-100 hover:bg-gray-50/50 hover:border-gray-200'
                    }`}
                    data-testid={`option-${i}`}
                  >
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} className="text-indigo-600 border-gray-300" />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer font-medium text-xs text-gray-700 leading-normal">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="rounded-xl text-xs font-bold border-gray-200"
                data-testid="prev-btn"
              >
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[currentQ?.question_id] === undefined}
                  className="rounded-xl text-xs font-bold bg-indigo-600 text-white"
                  data-testid="next-btn"
                >
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-6 shadow-md shadow-emerald-100"
                  data-testid="submit-quiz-btn"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
