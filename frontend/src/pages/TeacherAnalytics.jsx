import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, BarChart3, BookOpen, ClipboardCheck, Loader2, RefreshCw, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import API from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Stat({ icon: Icon, label, value, detail }) {
  return <Card className="rounded-[18px] border-gray-100 bg-white/90 shadow-soft"><CardContent className="p-5"><div className="mb-4 flex items-center justify-between"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon className="h-5 w-5" /></span><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span></div><p className="text-3xl font-extrabold tracking-tight text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{detail}</p></CardContent></Card>;
}

function EmptyState() {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 text-center"><BarChart3 className="mb-3 h-9 w-9 text-gray-300" /><p className="text-sm font-bold text-gray-700">No quiz performance data available</p><p className="mt-1 text-xs text-gray-400">Class scores will appear after students complete your quizzes.</p></div>;
}

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadAnalytics() {
    setLoading(true); setError(false);
    try {
      const response = await axios.get(`${API}/teacher/analytics`, { withCredentials: true });
      setAnalytics(response.data);
    } catch (requestError) {
      console.error('Error fetching teacher analytics:', requestError);
      setError(true);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadAnalytics(); }, []);

  if (loading) return <div className="min-h-screen ai-dashboard-bg"><Navbar /><main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"><div className="h-24 animate-pulse rounded-[20px] bg-white/70" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(item => <div key={item} className="h-32 animate-pulse rounded-[18px] bg-white/70" />)}</div><div className="h-96 animate-pulse rounded-[18px] bg-white/70" /></main></div>;

  return <div className="min-h-screen ai-dashboard-bg pb-14 text-gray-900"><Navbar /><main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Button variant="ghost" className="mb-3 -ml-3 text-xs font-bold text-indigo-600" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button><h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Class Analytics</h1><p className="mt-1 text-sm text-gray-500">Review real performance data from your classroom.</p></div><Button variant="outline" onClick={loadAnalytics}><RefreshCw className="h-4 w-4" />Refresh</Button></div>{error ? <Card className="rounded-[18px] border-red-100 bg-red-50/70"><CardContent className="flex items-center justify-between gap-4 p-5 text-sm text-red-700"><span>Failed to load analytics.</span><Button variant="outline" size="sm" onClick={loadAnalytics}>Retry</Button></CardContent></Card> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Users} label="Students" value={analytics.student_count} detail="Students in your class" /><Stat icon={BookOpen} label="Lectures" value={analytics.lecture_count} detail="Created by you" /><Stat icon={ClipboardCheck} label="Quizzes" value={analytics.quiz_count} detail="Created by you" /><Stat icon={Activity} label="Class Level" value={analytics.class_level || 'Not Available'} detail={analytics.average_score == null ? 'No score data yet' : `${analytics.average_score}% average score`} /></div><Card className="rounded-[18px] border-gray-100 bg-white/90 shadow-soft"><CardHeader><CardTitle className="text-xl font-bold text-gray-800">Performance Overview</CardTitle><CardDescription>Average quiz scores by assessment.</CardDescription></CardHeader><CardContent>{analytics.performance_trend?.length ? <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.performance_trend} margin={{ top: 12, right: 20, left: -12, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={value => value.length > 16 ? `${value.slice(0, 16)}...` : value} /><YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} /><Tooltip formatter={value => [`${value}%`, 'Average Score']} /><Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div> : <EmptyState />}</CardContent></Card></>}</main></div>;
}
