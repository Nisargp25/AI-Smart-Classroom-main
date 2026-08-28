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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Bot,
  Brain,
  Sparkles,
  Terminal,
  Play,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  Bug,
  LineChart,
  Code
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';

const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays / HashMap',
    successRate: 78,
    isAiRecommended: true,
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    hints: [
      'Try a brute force approach first: check every pair of numbers.',
      'Can we optimize it? Use a HashMap to store the complement of each number.',
      'The time complexity should be optimized to O(n) instead of O(n²).'
    ],
    defaultCode: {
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n    \n}',
      python: 'def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    pass',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Medium',
    topic: 'Algorithms',
    successRate: 64,
    isAiRecommended: true,
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with `O(log n)` runtime complexity.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    hints: [
      'Find the middle element of the array.',
      'If the target is smaller than the middle, narrow the search to the left half.',
      'Keep adjusting the low and high pointers until they meet.'
    ],
    defaultCode: {
      javascript: 'function search(nums, target) {\n    // Write your code here\n    \n}',
      python: 'def search(nums: List[int], target: int) -> int:\n    # Write your code here\n    pass',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};'
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stacks',
    successRate: 82,
    isAiRecommended: false,
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    examples: [
      { input: 's = "()[]{}"', output: 'true', explanation: 'All parentheses match correctly' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only.'
    ],
    hints: [
      'Use a stack to keep track of the opening brackets.',
      'When you see a closing bracket, check if it matches the bracket at the top of the stack.',
      'At the end, if the stack is empty, return true.'
    ],
    defaultCode: {
      javascript: 'function isValid(s) {\n    // Write your code here\n    \n}',
      python: 'def isValid(s: str) -> bool:\n    # Write your code here\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        \n    }\n};'
    }
  }
];

export default function CodingProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Workspace modes
  const [activeProblem, setActiveProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codeContent, setCodeContent] = useState('');
  
  // Simulated editor states
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [aiCodeReview, setAiCodeReview] = useState('');
  
  // progressive hints
  const [visibleHintIndex, setVisibleHintIndex] = useState(-1);

  // Coding Assistant chat in workspace
  const [assistantMessages, setAssistantMessages] = useState([
    { from: 'ai', text: 'Hi! Click one of the helper prompts below to explore the coding concepts.' }
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  useEffect(() => {
    fetchCodingData();
  }, []);

  const fetchCodingData = async () => {
    try {
      const response = await axios.get(`${API}/coding-profile`, { withCredentials: true });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching coding data:', error);
      toast.error('Failed to load coding profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (prob) => {
    setActiveProblem(prob);
    setCodeContent(prob.defaultCode[selectedLanguage] || prob.defaultCode['python']);
    setRunResult(null);
    setAiCodeReview('');
    setVisibleHintIndex(-1);
    setAssistantMessages([
      { from: 'ai', text: `Let's solve ${prob.title}. How can I assist you with this problem?` }
    ]);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (activeProblem) {
      setCodeContent(activeProblem.defaultCode[lang] || '');
    }
  };

  const handleRunCode = () => {
    setRunningCode(true);
    setRunResult(null);
    setTimeout(() => {
      setRunningCode(false);
      setRunResult({
        status: 'Passed',
        runtime: 42,
        memory: 14.8,
        stdout: 'nums = [2,7,11,15], target = 9\nOutput matches expected!'
      });
      toast.success('Code executed successfully on test cases.');
    }, 1500);
  };

  const handleSubmitCode = async () => {
    setSubmittingCode(true);
    setRunResult(null);
    setAiCodeReview('');
    setTimeout(() => {
      setSubmittingCode(false);
      setRunResult({
        status: 'Accepted',
        runtime: 38,
        memory: 14.2,
        stdout: 'All 48 test cases passed.'
      });
      
      // AI Code review copywriting
      if (activeProblem.id === 'two-sum') {
        setAiCodeReview('Your solution works, but the time complexity is O(n²). CampusAI recommends using a HashMap/Dictionary to achieve O(n) runtime complexity and avoid brute-forcing.');
      } else if (activeProblem.id === 'binary-search') {
        setAiCodeReview('Excellent implementation of Binary Search! The O(log n) time complexity is achieved properly. Consider handling edge cases where low > high.');
      } else {
        setAiCodeReview('Your stack solution is robust and achieves O(n) time and space complexity, which is optimal. Great formatting!');
      }
      
      toast.success('Problem submitted and accepted!');
    }, 1800);
  };

  const handleAssistantAction = (actionType) => {
    if (!activeProblem) return;
    setAssistantLoading(true);
    
    setTimeout(() => {
      let responseText = '';
      if (actionType === 'explain') {
        responseText = `The goal of ${activeProblem.title} is to find a set of values or index that matches target requirements. You should break it down using pointers or hashing.`;
      } else if (actionType === 'hint') {
        responseText = `Here is a strategy: ${activeProblem.hints[0]} Try plotting the lookup values to see if you can retrieve indices in one sweep.`;
      } else if (actionType === 'complexity') {
        responseText = `Brute force would require O(n²) time. By trading memory for speed, we can store values in a key-value store to retrieve matches in O(1) lookup time, resulting in O(n) overall.`;
      } else if (actionType === 'bug') {
        responseText = `Double check your index boundaries. In some languages, exceeding pointer lengths will trigger SegFaults.`;
      } else {
        responseText = `Let's inspect your formatting. Your solution structure is optimal. Try executing it.`;
      }
      
      setAssistantMessages(prev => [
        ...prev,
        { from: 'user', text: `Requesting ${actionType} details...` },
        { from: 'ai', text: responseText }
      ]);
      setAssistantLoading(false);
    }, 800);
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

  // ============ MODE 2: IMPERSIVE CODE EDITOR WORKSPACE ============
  if (activeProblem) {
    return (
      <div className="min-h-screen ai-dashboard-bg flex flex-col justify-between" data-testid="coding-problem-page">
        <Navbar />

        <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:grid md:grid-cols-12 gap-6 items-stretch">
          
          {/* Back button */}
          <div className="col-span-12">
            <Button 
              onClick={() => setActiveProblem(null)}
              variant="ghost" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>

          {/* LEFT 4 COLS: Problem Statement */}
          <div className="md:col-span-4 flex flex-col h-full">
            <Card className="bento-tile p-6 border-gray-100 shadow-soft bg-white/95 flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-50 border-indigo-100/50 text-indigo-600 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                    {activeProblem.topic}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase rounded-lg px-2 ${
                    activeProblem.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {activeProblem.difficulty}
                  </Badge>
                </div>

                <h2 className="text-xl font-extrabold text-gray-800 leading-snug">{activeProblem.title}</h2>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Description</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-3 rounded-xl border border-gray-100 font-mono whitespace-pre-wrap">
                    {activeProblem.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Examples</h3>
                  {activeProblem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-indigo-50/30 border border-indigo-50 rounded-2xl p-3 text-[11px] space-y-1">
                      <p className="text-gray-700"><span className="font-bold">Input:</span> {ex.input}</p>
                      <p className="text-gray-700"><span className="font-bold">Output:</span> {ex.output}</p>
                      {ex.explanation && (
                        <p className="text-gray-500 italic mt-1"><span className="font-bold">Explanation:</span> {ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Constraints</h3>
                  <ul className="text-[11px] text-gray-500 font-mono space-y-1 pl-4 list-disc">
                    {activeProblem.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progressive Hints Drawer inside description panel */}
              <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                  Progressive Hints
                </h4>
                
                {visibleHintIndex === -1 && (
                  <Button 
                    onClick={() => setVisibleHintIndex(0)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold w-full"
                  >
                    Reveal Hint 1
                  </Button>
                )}

                {visibleHintIndex >= 0 && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 space-y-2.5 animate-fade-in">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      💡 <b>Hint {visibleHintIndex + 1}:</b> {activeProblem.hints[visibleHintIndex]}
                    </p>
                    
                    <div className="flex gap-2">
                      {visibleHintIndex < activeProblem.hints.length - 1 ? (
                        <Button 
                          onClick={() => setVisibleHintIndex(prev => prev + 1)}
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-xl text-[10px] font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          Reveal Next Hint
                        </Button>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-none rounded-lg text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 mx-auto">
                          All Hints Revealed
                        </Badge>
                      )}
                      <Button 
                        onClick={() => setVisibleHintIndex(-1)}
                        size="sm"
                        variant="ghost"
                        className="rounded-xl text-[10px] font-bold text-gray-400 hover:text-gray-600"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </Card>
          </div>

          {/* CENTER 5 COLS: Code Editor & console */}
          <div className="md:col-span-5 flex flex-col h-full space-y-6">
            
            {/* Editor Console wrapper */}
            <Card className="bento-tile p-5 border-gray-100 shadow-soft bg-white flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                    <span className="font-extrabold text-sm text-gray-800">IDE Console</span>
                  </div>
                  
                  <div className="w-32">
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="rounded-xl border-gray-100 bg-white text-xs font-semibold h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python" className="text-xs">Python</SelectItem>
                        <SelectItem value="javascript" className="text-xs">JavaScript</SelectItem>
                        <SelectItem value="java" className="text-xs">Java</SelectItem>
                        <SelectItem value="cpp" className="text-xs">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Styled editor textarea block */}
                <div className="flex-1 relative font-mono text-xs rounded-2xl border border-gray-100 overflow-hidden bg-[#0F172A] p-4 text-[#38BDF8]">
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed text-indigo-300"
                    style={{ fontStyle: 'normal' }}
                  />
                </div>
              </div>

              {/* Console Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRunCode}
                    disabled={runningCode || submittingCode}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border-indigo-100 text-indigo-600 bg-white"
                  >
                    {runningCode ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                    Run Code
                  </Button>
                  <Button 
                    onClick={handleSubmitCode}
                    disabled={runningCode || submittingCode}
                    className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {submittingCode ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                    Submit Code
                  </Button>
                </div>
              </div>
            </Card>

            {/* Run / Submit execution results card */}
            {runResult && (
              <Card className="bento-tile p-5 border-gray-100 shadow-soft bg-white animate-fade-in">
                <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-gray-800 uppercase tracking-widest">Execution Result</CardTitle>
                  <Badge className={runResult.status === 'Accepted' || runResult.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}>
                    {runResult.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 space-y-2 font-mono text-[10px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-2">
                    <div>Runtime: <span className="font-bold text-gray-800">{runResult.runtime} ms</span></div>
                    <div>Memory: <span className="font-bold text-gray-800">{runResult.memory} MB</span></div>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-gray-500">{runResult.stdout}</pre>
                </CardContent>
              </Card>
            )}

            {/* Post-submission AI code review panel */}
            {aiCodeReview && (
              <Card className="bento-tile p-5 border-purple-100 bg-purple-50/30 shadow-soft animate-fade-in">
                <CardContent className="p-0 flex gap-3 text-xs">
                  <Brain className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800">CampusAI Code Review</h4>
                    <p className="text-gray-600 leading-relaxed font-medium">{aiCodeReview}</p>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* RIGHT 3 COLS: CampusAI Coding Assistant */}
          <div className="md:col-span-3 flex flex-col h-full">
            <Card className="bento-tile p-5 border-indigo-100 bg-indigo-950 text-indigo-100 shadow-lg flex-1 flex flex-col justify-between overflow-hidden">
              
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="pb-3 border-b border-white/10 space-y-1">
                  <Badge className="bg-indigo-500/20 text-indigo-200 border-none text-[9px] font-bold uppercase rounded-lg px-2">
                    Progressive Helper
                  </Badge>
                  <h3 className="font-extrabold text-xs flex items-center gap-1.5 text-white">
                    <Bot className="w-4.5 h-4.5 text-indigo-400" />
                    CampusAI Coding Assistant
                  </h3>
                </div>

                {/* Assistant Chat logs */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs">
                  {assistantMessages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-2xl leading-relaxed ${
                      msg.from === 'ai' 
                        ? 'bg-white/5 border border-white/10 text-indigo-100'
                        : 'bg-indigo-600 text-white font-bold ml-auto w-fit max-w-[85%]'
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                  {assistantLoading && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 w-fit text-indigo-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> Analyzing complexity...
                    </div>
                  )}
                </div>
              </div>

              {/* Chat action prompt triggers */}
              <div className="pt-4 border-t border-white/10 space-y-2 shrink-0">
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Assistant Queries</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleAssistantAction('explain')}
                    variant="outline"
                    className="rounded-xl text-[10px] font-bold py-2 bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:text-white"
                  >
                    Explain Problem
                  </Button>
                  <Button 
                    onClick={() => handleAssistantAction('hint')}
                    variant="outline"
                    className="rounded-xl text-[10px] font-bold py-2 bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:text-white"
                  >
                    Give Code Hint
                  </Button>
                  <Button 
                    onClick={() => handleAssistantAction('complexity')}
                    variant="outline"
                    className="rounded-xl text-[10px] font-bold py-2 bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:text-white"
                  >
                    Explain Complexity
                  </Button>
                  <Button 
                    onClick={() => handleAssistantAction('bug')}
                    variant="outline"
                    className="rounded-xl text-[10px] font-bold py-2 bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:text-white"
                  >
                    Find Bug
                  </Button>
                </div>
              </div>

            </Card>
          </div>

        </main>

        <FloatingAIButton />
      </div>
    );
  }

  // ============ MODE 1: PRACTICE DASHBOARD LISTS ============
  return (
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="coding-profile-page">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-8 h-8 text-indigo-600" />
            CampusAI Coding
          </h1>
          <p className="text-gray-500 mt-1">Practice coding, solve DSA problems, and sync developer metrics.</p>
        </div>

        {/* Stats Overview */}
        <Card className="bento-tile p-6 border-gray-100 shadow-soft bg-white/90 mb-8" data-testid="coding-overview">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-4xl font-black text-gray-800 tracking-tight">{profile?.total_problems || 0}</p>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-indigo-600 tracking-tight">{Math.round(profile?.coding_score || 0)}</p>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">Coding Score</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-cyan-600 tracking-tight">78%</p>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-orange-500 tracking-tight">Intermediate</p>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">Skill Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems List Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-[24px] border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Code className="w-4 h-4" /> Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {['DSA', 'Java', 'Python', 'C++', 'SQL', 'Web'].map((cat, idx) => (
                  <Badge key={idx} className={idx === 0 ? 'bg-indigo-600 text-white rounded-lg text-xs py-1 px-3' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs py-1 px-3 border-none'}>
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {PROBLEMS.map((prob) => (
                <Card 
                  key={prob.id}
                  className="bento-tile p-5 flex items-center justify-between gap-6 border-gray-100 shadow-soft bg-white/90 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-gray-800 truncate">{prob.title}</h4>
                      {prob.isAiRecommended && (
                        <Badge className="bg-purple-50 text-purple-700 border border-purple-100 text-[8px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          <Sparkles className="w-2.5 h-2.5" /> AI Recommended
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className={`font-bold ${
                        prob.difficulty === 'Easy' ? 'text-green-600' : 'text-amber-600'
                      }`}>{prob.difficulty}</span>
                      <span>Topic: {prob.topic}</span>
                      <span>Success Rate: {prob.successRate}%</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSelectProblem(prob)}
                    className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-9 shrink-0 flex items-center gap-1"
                  >
                    Solve <ChevronRight className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Platforms Link Sidebar */}
          <div className="space-y-6">
            <Card className="bento-tile p-6 border-gray-100 shadow-soft bg-white/90">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                  Developer Sync
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Sync problems solved on LeetCode/HackerRank</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {['LeetCode', 'HackerRank'].map((plat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <Label className="text-xs text-gray-600 font-bold uppercase tracking-wider">{plat} Username</Label>
                    <div className="flex gap-2">
                      <Input placeholder={`@username`} className="rounded-xl text-xs border-gray-200 h-9" />
                      <Button variant="outline" className="rounded-xl text-xs font-bold border-gray-200 h-9">
                        Sync
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bento-tile p-5 border-gray-100 text-xs text-gray-400 space-y-3">
              <h4 className="font-bold text-gray-700 flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                Active coding streak
              </h4>
              <p className="leading-relaxed">
                Solve at least 1 coding problem daily to keep your streak going and boost accuracy metrics.
              </p>
            </Card>
          </div>

        </div>

      </main>

      <FloatingAIButton />
    </div>
  );
}
