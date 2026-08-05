import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LectureView() {
  const { lectureId } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [processingNow, setProcessingNow] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [showRawSummary, setShowRawSummary] = useState(false);

  const fetchLecture = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await axios.get(`${API}/lectures/${lectureId}`, { withCredentials: true });
      setLecture(response.data);
    } catch (error) {
      console.error('Error fetching lecture:', error);
      if (!silent) {
        toast.error('Failed to load lecture');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

// Polling effect: periodically refresh the lecture while it is still processing.
  //
  // NOTE: We intentionally reference only `lecture?.status` (a primitive) inside
  // the effect body instead of the whole `lecture` object.
  //
  // Why:
  //  - `lecture` is a state object that gets a NEW reference on every fetch,
  //    so adding the whole object to the dependency array would tear down and
  //    re-create the interval after every silent fetch (every 5s), needlessly
  //    resetting the timer and fighting a possible re-render loop.
  //  - `lecture?.status` is a string primitive that only changes identity when
  //    the status actually changes (e.g. 'processing' -> 'completed'). This is
  //    the only value this effect actually needs, so placing it in the deps
  //    array satisfies `react-hooks/exhaustive-deps` WITHOUT disabling any
  //    ESLint rule and WITHOUT causing unnecessary re-runs.
  useEffect(() => {
    if (!lecture?.status || lecture?.status === 'completed') {
      return;
    }

    const intervalId = setInterval(() => {
      fetchLecture({ silent: true });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchLecture, lecture?.status]);

  const handleProcessNow = async () => {
    try {
      setProcessingNow(true);
      await axios.post(`${API}/lectures/${lectureId}/process`, {}, { withCredentials: true });
      await fetchLecture();
      toast.success('Lecture processing completed');
    } catch (error) {
      console.error('Error processing lecture:', error);
      const message = error.response?.data?.detail || 'Failed to process lecture';
      toast.error(message);
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
      const message = error.response?.data?.detail || 'Failed to regenerate deep notes';
      toast.error(message);
    } finally {
      setRegenerating(false);
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

  const summary = lecture.summary || {};

  return (
    <div className="min-h-screen bg-background" data-testid="lecture-view">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/lectures"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lectures
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{lecture.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {lecture.subject}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {lecture.teacher_name}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(lecture.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lecture.status === 'completed' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateDeepNotes}
                  disabled={regenerating}
                  data-testid="regenerate-deep-notes"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? 'Regenerating...' : 'Regenerate Deep Notes'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRawSummary(s => !s)}
                className="ml-2"
              >
                {showRawSummary ? 'Hide Raw Summary' : 'Show Raw Summary'}
              </Button>
              <Badge variant={lecture.status === 'completed' ? 'default' : 'outline'} className="text-sm">
                {lecture.status}
              </Badge>
            </div>
          </div>
        </div>

        {lecture.status !== 'completed' ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Lecture is being processed</p>
              <p className="text-muted-foreground">Check back soon for generated notes and summaries.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefreshStatus}
                  disabled={refreshingStatus || processingNow}
                  data-testid="refresh-lecture-status"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshingStatus ? 'animate-spin' : ''}`} />
                  {refreshingStatus ? 'Refreshing...' : 'Refresh Status'}
                </Button>
                <Button
                  type="button"
                  onClick={handleProcessNow}
                  disabled={processingNow || refreshingStatus}
                  data-testid="process-lecture-now"
                >
                  <Play className={`w-4 h-4 mr-2 ${processingNow ? 'animate-spin' : ''}`} />
                  {processingNow ? 'Processing...' : 'Process Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:w-fit lg:grid-cols-5">
              <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
              <TabsTrigger value="concepts" data-testid="tab-concepts">Key Concepts</TabsTrigger>
              <TabsTrigger value="deep-notes" data-testid="tab-deep-notes">Deep Notes</TabsTrigger>
              <TabsTrigger value="homework" data-testid="tab-homework">Homework</TabsTrigger>
              <TabsTrigger value="transcript" data-testid="tab-transcript">Transcript</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Topics Learned */}
                <Card className="animate-fade-in" data-testid="topics-learned">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListChecks className="w-5 h-5 text-primary" />
                      Topics Learned Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(summary.topics_learned || []).map((topic, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Important Points */}
                <Card className="animate-fade-in stagger-1" data-testid="important-points">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Important Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(summary.important_points || []).map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Topic Summaries */}
              <Card className="animate-fade-in stagger-2" data-testid="topic-summaries">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Topic Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(summary.topic_summaries || {}).map(([topic, description], i) => (
                      <div key={i} className="p-4 bg-accent/50 rounded-lg">
                        <h4 className="font-semibold mb-1">{topic}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Concepts Tab */}
            <TabsContent value="concepts">
              <Card className="animate-fade-in" data-testid="key-concepts">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Key Concepts
                  </CardTitle>
                  <CardDescription>Core concepts covered in this lecture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(summary.key_concepts || []).map((concept, i) => (
                      <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deep Notes Tab */}
            <TabsContent value="deep-notes" className="space-y-6">
              <Card className="animate-fade-in" data-testid="detailed-explanations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Detailed Explanations
                  </CardTitle>
                  <CardDescription>Expanded topic-wise notes for deeper understanding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(summary.detailed_explanations || summary.topic_summaries || {}).map(([topic, description], i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <h4 className="font-semibold mb-2">{topic}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                      </div>
                    ))}
                    {Object.keys(summary.detailed_explanations || summary.topic_summaries || {}).length === 0 && (
                      <p className="text-sm text-muted-foreground">No detailed explanations available for this lecture yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="animate-fade-in stagger-1" data-testid="step-breakdown">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListChecks className="w-5 h-5 text-primary" />
                      Step-by-Step Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {(summary.step_by_step_breakdown || []).map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in stagger-2" data-testid="real-world-applications">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Real-World Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
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

              <Card className="animate-fade-in" data-testid="worked-examples">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Play className="w-5 h-5 text-primary" />
                    Worked Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(summary.worked_examples || []).map((example, i) => (
                      <div key={i} className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-semibold">{example.title || `Example ${i + 1}`}</h4>
                        <p className="text-sm"><span className="font-medium">Problem:</span> {example.problem}</p>
                        <p className="text-sm"><span className="font-medium">Approach:</span> {example.approach}</p>
                        <p className="text-sm"><span className="font-medium">Solution:</span> {example.solution}</p>
                      </div>
                    ))}
                    {(summary.worked_examples || []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No worked examples available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" data-testid="exam-questions">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Likely Exam Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(summary.exam_questions || []).map((item, i) => (
                      <div key={i} className="rounded-lg bg-accent/50 p-4 space-y-1">
                        <p className="font-medium">Q{i + 1}. {item.question}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Answer:</span> {item.answer}</p>
                      </div>
                    ))}
                    {(summary.exam_questions || []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No exam-style questions generated yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Homework Tab */}
            <TabsContent value="homework" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Homework */}
                <Card className="animate-fade-in" data-testid="homework-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Homework
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(summary.homework || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {i + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Revision Checklist */}
                <Card className="animate-fade-in stagger-1" data-testid="revision-checklist">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListChecks className="w-5 h-5 text-secondary" />
                      Revision Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(summary.revision_checklist || []).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
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
              <Card className="animate-fade-in" data-testid="transcript-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Full Transcript
                  </CardTitle>
                  <CardDescription>AI-cleaned transcript of the lecture</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 rounded-lg border p-4">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {lecture.clean_transcript || lecture.raw_transcript || 'No transcript available'}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {showRawSummary && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Raw Summary (for debugging)</CardTitle>
                <CardDescription>The exact JSON returned by the API</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded">{JSON.stringify(lecture.summary, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
          </>
        )}
      </main>
    </div>
  );
}
