import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Award,
  Clock,
  Play,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`${API}/quizzes`, { withCredentials: true });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background" data-testid="quizzes-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>

        {/* Quizzes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length > 0 ? quizzes.map((quiz, i) => (
            <Card
              key={quiz.quiz_id}
              className="card-hover animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
              data-testid={`quiz-card-${i}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <Badge variant="outline">{quiz.topic}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{quiz.subject}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{quiz.questions?.length || 0} questions</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.time_limit} min
                  </span>
                </div>
                <Button asChild className="w-full" data-testid={`start-quiz-${quiz.quiz_id}`}>
                  <Link to={`/quizzes/${quiz.quiz_id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No quizzes available</p>
              <p className="text-sm text-muted-foreground">Check back later for new quizzes</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
