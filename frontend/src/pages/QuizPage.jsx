import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API}/quizzes/${quizId}`, { withCredentials: true });
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await axios.post(
        `${API}/quizzes/${quizId}/submit`,
        { answers, time_taken: timeTaken },
        { withCredentials: true }
      );
      setResult(response.data);
      setSubmitted(true);
      toast.success('Quiz submitted!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
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

  // Results view
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background" data-testid="quiz-results">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                {result.percentage >= 70 ? (
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-secondary" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-amber-500" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-muted-foreground mb-6">
                {result.percentage >= 70 ? 'Great job! Keep up the good work!' : 'Good effort! Review the topics and try again.'}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-3xl font-bold text-primary">{result.score}/{result.total}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-3xl font-bold text-secondary">{Math.round(result.percentage)}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-3xl font-bold">{Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>

              {/* Review Questions */}
              <div className="text-left space-y-4 mb-8">
                <h3 className="font-semibold">Review Answers</h3>
                {questions.map((q, i) => {
                  const userAnswer = answers[q.question_id];
                  const isCorrect = userAnswer === q.correct_answer;
                  return (
                    <div key={i} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <p className="font-medium">{q.question}</p>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Your answer: {q.options[userAnswer] || 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 dark:text-green-400 ml-7">
                          Correct: {q.options[q.correct_answer]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/quizzes')} data-testid="back-to-quizzes-btn">
                  Back to Quizzes
                </Button>
                <Button onClick={() => navigate('/dashboard')} data-testid="go-dashboard-btn">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Quiz taking view
  return (
    <div className="min-h-screen bg-background" data-testid="quiz-page">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Header */}
        <Card className="mb-6 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{quiz.title}</h2>
              <Badge>{quiz.topic}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {quiz.time_limit} min
              </span>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="animate-fade-in" data-testid="question-card">
          <CardContent className="p-6">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4">{currentQ?.difficulty || 'medium'}</Badge>
              <h3 className="text-xl font-semibold">{currentQ?.question}</h3>
            </div>

            <RadioGroup
              value={answers[currentQ?.question_id]?.toString()}
              onValueChange={(val) => handleAnswer(currentQ?.question_id, parseInt(val))}
              className="space-y-3"
            >
              {currentQ?.options.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQ?.question_id] === i
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                  data-testid={`option-${i}`}
                >
                  <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                data-testid="prev-btn"
              >
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[currentQ?.question_id] === undefined}
                  data-testid="next-btn"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="bg-secondary hover:bg-secondary/90"
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
