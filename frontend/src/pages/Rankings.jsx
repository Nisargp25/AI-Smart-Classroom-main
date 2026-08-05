import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Award,
  Target,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Rankings() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const [rankRes, myRankRes] = await Promise.all([
        axios.get(`${API}/rankings`, { withCredentials: true }),
        axios.get(`${API}/rankings/me`, { withCredentials: true }),
      ]);
      setRankings(rankRes.data);
      setMyRanking(myRankRes.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast.error('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center font-bold text-muted-foreground">#{rank}</span>;
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
    <div className="min-h-screen bg-background" data-testid="rankings-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">See how you rank against your peers</p>
        </div>

        {/* My Ranking Card */}
        {myRanking && myRanking.class_rank > 0 && (
          <Card className="mb-8 animate-fade-in bg-gradient-to-br from-primary/10 to-secondary/10" data-testid="my-ranking">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/20">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Current Rank</p>
                    <p className="text-4xl font-bold">#{myRanking.class_rank}</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accentText">{Math.round(myRanking.academic_score)}%</p>
                    <p className="text-sm text-muted-foreground">Academic</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{Math.round(myRanking.coding_score)}</p>
                    <p className="text-sm text-muted-foreground">Coding</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(myRanking.total_score)}</p>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[rankings[1], rankings[0], rankings[2]].map((r, i) => {
              const position = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = ['h-32', 'h-40', 'h-28'];
              const bgColors = ['bg-slate-400/20', 'bg-yellow-500/20', 'bg-amber-600/20'];
              return (
                <Card
                  key={r?.user_id || i}
                  className={`animate-fade-in ${heights[i]} flex flex-col justify-end`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  data-testid={`podium-${position}`}
                >
                  <CardContent className={`p-4 text-center ${bgColors[i]} rounded-b-lg`}>
                    <Avatar className="h-12 w-12 mx-auto mb-2 border-2 border-white">
                      <AvatarFallback>{r?.user_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    {getRankIcon(position)}
                    <p className="font-semibold truncate mt-1">{r?.user_name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(r?.total_score || 0)} pts</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full Rankings Table */}
        <Card className="animate-fade-in stagger-2" data-testid="rankings-table">
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
            <CardDescription>Based on academic performance, coding skills, and attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Academic</TableHead>
                  <TableHead className="text-center">Coding</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.length > 0 ? rankings.map((r, i) => (
                  <TableRow
                    key={r.user_id}
                    className={r.user_id === user?.user_id ? 'bg-primary/5' : ''}
                    data-testid={`ranking-row-${i}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankIcon(r.class_rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{r.user_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{r.user_name}</span>
                        {r.user_id === user?.user_id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-primary/10">
                        {Math.round(r.academic_score)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-secondary/10">
                        {Math.round(r.coding_score)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {Math.round(r.attendance_score)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{Math.round(r.total_score)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No rankings yet. Complete quizzes to appear on the leaderboard!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
