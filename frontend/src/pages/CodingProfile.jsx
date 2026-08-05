import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  Code2,
  Link as LinkIcon,
  ExternalLink,
  Trophy,
  Target,
  Flame,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CodingProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [usernames, setUsernames] = useState({
    leetcode: '',
    hackerrank: '',
    codechef: '',
    geeksforgeeks: '',
  });

  useEffect(() => {
    fetchCodingData();
  }, []);

  const fetchCodingData = async () => {
    try {
      const [profileRes, recsRes] = await Promise.all([
        axios.get(`${API}/coding-profile`, { withCredentials: true }),
        axios.get(`${API}/coding-recommendations`, { withCredentials: true }),
      ]);
      setProfile(profileRes.data);
      setRecommendations(recsRes.data.recommendations || []);
      
      // Pre-fill usernames if available
      if (profileRes.data) {
        setUsernames({
          leetcode: profileRes.data.leetcode?.username || '',
          hackerrank: profileRes.data.hackerrank?.username || '',
          codechef: profileRes.data.codechef?.username || '',
          geeksforgeeks: profileRes.data.geeksforgeeks?.username || '',
        });
      }
    } catch (error) {
      console.error('Error fetching coding data:', error);
      toast.error('Failed to load coding profile');
    } finally {
      setLoading(false);
    }
  };

  const syncPlatform = async (platform) => {
    const username = usernames[platform];
    if (!username) {
      toast.error(`Please enter your ${platform} username`);
      return;
    }

    setSyncing(true);
    try {
      const response = await axios.put(
        `${API}/coding-profile`,
        { [`${platform}_username`]: username },
        { withCredentials: true }
      );
      setProfile(response.data);
      toast.success(`${platform} profile synced! (MOCKED data for demo)`);
    } catch (error) {
      console.error('Error syncing platform:', error);
      toast.error('Failed to sync platform');
    } finally {
      setSyncing(false);
    }
  };

  const platforms = [
    { key: 'leetcode', name: 'LeetCode', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { key: 'hackerrank', name: 'HackerRank', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { key: 'codechef', name: 'CodeChef', color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
    { key: 'geeksforgeeks', name: 'GeeksforGeeks', color: 'text-green-600', bgColor: 'bg-green-600/10' },
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
    <div className="min-h-screen bg-background" data-testid="coding-profile-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            Coding Profile
          </h1>
          <p className="text-muted-foreground">Track your progress across coding platforms</p>
        </div>

        {/* Stats Overview */}
        <Card className="mb-8 animate-fade-in" data-testid="coding-overview">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-accentText">{profile?.total_problems || 0}</p>
                <p className="text-sm text-muted-foreground">Total Problems</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary">{Math.round(profile?.coding_score || 0)}</p>
                <p className="text-sm text-muted-foreground">Coding Score</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-500">
                  {platforms.filter(p => profile?.[p.key]).length}
                </p>
                <p className="text-sm text-muted-foreground">Linked Platforms</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-500">{profile?.leetcode?.contest_rating || '-'}</p>
                <p className="text-sm text-muted-foreground">Contest Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Platform Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="leetcode" className="space-y-4">
              <TabsList>
                {platforms.map(p => (
                  <TabsTrigger key={p.key} value={p.key} data-testid={`tab-${p.key}`}>
                    {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {platforms.map(platform => (
                <TabsContent key={platform.key} value={platform.key}>
                  <Card className="animate-fade-in" data-testid={`${platform.key}-card`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${platform.color}`}>
                        <Code2 className="w-5 h-5" />
                        {platform.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Link Account */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`${platform.key}-username`}>Username</Label>
                          <Input
                            id={`${platform.key}-username`}
                            placeholder={`Enter your ${platform.name} username`}
                            value={usernames[platform.key]}
                            onChange={e => setUsernames({ ...usernames, [platform.key]: e.target.value })}
                            data-testid={`${platform.key}-input`}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => syncPlatform(platform.key)}
                            disabled={syncing}
                            data-testid={`sync-${platform.key}-btn`}
                          >
                            {syncing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Sync
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Platform Stats */}
                      {profile?.[platform.key] && (
                        <div className="space-y-4">
                          <Separator />
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">Linked as @{profile[platform.key].username}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${platform.bgColor}`}>
                              <p className="text-2xl font-bold">{profile[platform.key].problems_solved}</p>
                              <p className="text-xs text-muted-foreground">Problems Solved</p>
                            </div>
                            {platform.key === 'leetcode' && (
                              <>
                                <div className="p-4 rounded-lg bg-green-500/10">
                                  <p className="text-2xl font-bold text-green-500">{profile[platform.key].easy}</p>
                                  <p className="text-xs text-muted-foreground">Easy</p>
                                </div>
                                <div className="p-4 rounded-lg bg-yellow-500/10">
                                  <p className="text-2xl font-bold text-yellow-500">{profile[platform.key].medium}</p>
                                  <p className="text-xs text-muted-foreground">Medium</p>
                                </div>
                              </>
                            )}
                            {platform.key === 'hackerrank' && (
                              <>
                                <div className="p-4 rounded-lg bg-secondary/10">
                                  <p className="text-2xl font-bold text-secondary">{profile[platform.key].badges}</p>
                                  <p className="text-xs text-muted-foreground">Badges</p>
                                </div>
                                <div className="p-4 rounded-lg bg-primary/10">
                                  <p className="text-2xl font-bold text-accentText">{profile[platform.key].points}</p>
                                  <p className="text-xs text-muted-foreground">Points</p>
                                </div>
                              </>
                            )}
                            {platform.key === 'codechef' && (
                              <>
                                <div className="p-4 rounded-lg bg-primary/10">
                                  <p className="text-2xl font-bold text-accentText">{profile[platform.key].rating}</p>
                                  <p className="text-xs text-muted-foreground">Rating</p>
                                </div>
                                <div className="p-4 rounded-lg bg-amber-500/10">
                                  <p className="text-2xl font-bold text-amber-500">{profile[platform.key].stars}★</p>
                                  <p className="text-xs text-muted-foreground">Stars</p>
                                </div>
                              </>
                            )}
                            {platform.key === 'geeksforgeeks' && (
                              <>
                                <div className="p-4 rounded-lg bg-primary/10">
                                  <p className="text-2xl font-bold text-accentText">{profile[platform.key].score}</p>
                                  <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/10">
                                  <p className="text-2xl font-bold text-secondary">#{profile[platform.key].rank}</p>
                                  <p className="text-xs text-muted-foreground">Rank</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <Card className="animate-fade-in stagger-1" data-testid="recommendations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Recommended Problems
                </CardTitle>
                <CardDescription>Based on your weak topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.length > 0 ? recommendations.map((rec, i) => (
                    <a
                      key={i}
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                      data-testid={`recommendation-${i}`}
                    >
                      <div>
                        <p className="font-medium group-hover:text-accentText transition-colors">
                          {rec.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{rec.platform}</Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              rec.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                              rec.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {rec.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accentText" />
                    </a>
                  )) : (
                    <p className="text-center text-muted-foreground py-4">
                      Complete quizzes to get personalized recommendations
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in stagger-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <Flame className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="font-semibold">Keep Practicing!</p>
                  <p className="text-sm text-muted-foreground">
                    Solve problems daily to improve your ranking
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
