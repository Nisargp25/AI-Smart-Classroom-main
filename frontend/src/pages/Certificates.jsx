import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import FloatingAIButton from '../components/ai-dashboard/FloatingAIButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Award,
  Download,
  CheckCircle2,
  QrCode,
  Calendar,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${API}/certificates`, { withCredentials: true });
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/certificates/generate`,
        { course_name: 'CampusAI Professional Learning Certificate' },
        { withCredentials: true }
      );
      setCertificates(prev => [response.data, ...prev]);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = (cert) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    ctx.textAlign = 'center';

    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
    };

    // CampusAI visual system: soft grid, bright accents, and a bento-style score panel.
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#f8fbff');
    background.addColorStop(0.55, '#ffffff');
    background.addColorStop(1, '#faf7ff');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.07)'; ctx.lineWidth = 1;
    for (let x = 40; x < width - 40; x += 32) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, height - 40); ctx.stroke(); }
    for (let y = 40; y < height - 40; y += 32) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(width - 40, y); ctx.stroke(); }
    const frame = ctx.createLinearGradient(40, 40, width - 40, height - 40);
    frame.addColorStop(0, '#4f46e5'); frame.addColorStop(0.5, '#22d3ee'); frame.addColorStop(1, '#a855f7');
    roundRect(24, 24, width - 48, height - 48, 28); ctx.fillStyle = frame; ctx.fill();
    roundRect(39, 39, width - 78, height - 78, 18); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 34px Arial'; ctx.textAlign = 'left'; ctx.fillText('CampusAI', 88, 112);
    ctx.fillStyle = '#4f46e5'; ctx.font = 'bold 15px Arial'; ctx.fillText('LEARNING PLATFORM', 91, 137);
    ctx.fillStyle = '#22d3ee'; ctx.fillRect(88, 151, 82, 4);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 62px Arial'; ctx.fillText('CERTIFICATE', centerX, 235);
    ctx.fillStyle = '#4f46e5'; ctx.font = 'bold 23px Arial'; ctx.fillText('OF PROFESSIONAL ACHIEVEMENT', centerX, 278);
    ctx.fillStyle = '#475569'; ctx.font = '23px Arial'; ctx.fillText('This credential is awarded to', centerX, 350);
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 54px Georgia'; ctx.fillText(cert.user_name || 'Verified Learner', centerX, 425);
    ctx.beginPath(); ctx.moveTo(280, 450); ctx.lineTo(920, 450); ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.font = '23px Arial'; ctx.fillText(`For completing ${cert.course_name || 'CampusAI Professional Learning Certificate'}`, centerX, 510);
    roundRect(260, 535, 680, 58, 16); ctx.fillStyle = '#eef4ff'; ctx.fill();
    ctx.fillStyle = '#3730a3'; ctx.font = 'bold 21px Arial'; ctx.fillText(`Academic ${Math.round(cert.academic_score || 0)}%   |   Coding ${Math.round(cert.coding_score || 0)}   |   Rank #${cert.overall_rank || '-'}`, centerX, 571);
    const issuedOn = new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#64748b'; ctx.font = '18px Arial'; ctx.fillText(`Issued on ${issuedOn}`, centerX, 625);
    ctx.textAlign = 'left'; ctx.fillStyle = '#0f172a'; ctx.font = 'bold 23px Arial'; ctx.fillText('CampusAI Learning Team', 112, 724);
    ctx.fillStyle = '#64748b'; ctx.font = '15px Arial'; ctx.fillText('Authorized Credential Issuer', 114, 750);
    roundRect(875, 687, 210, 78); ctx.fillStyle = '#f5f3ff'; ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#4f46e5'; ctx.font = 'bold 20px Arial'; ctx.fillText('VERIFIED', 980, 718);
    ctx.fillStyle = '#64748b'; ctx.font = '14px monospace'; ctx.fillText(cert.verification_code, 980, 744);

    const link = document.createElement('a');
    link.download = `certificate-${cert.verification_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Certificate downloaded!');
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
    <div className="min-h-screen ai-dashboard-bg relative overflow-x-hidden pb-12" data-testid="certificates-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Award className="w-8 h-8 text-indigo-600 animate-float-slow" />
              My Certificates
            </h1>
            <p className="text-gray-500 mt-1">Your achievements and completed learning milestones.</p>
          </div>
          
          <Button 
            onClick={generateCertificate} 
            disabled={generating} 
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 shadow-lg shadow-indigo-100"
            data-testid="generate-cert-btn"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-1.5" />
            )}
            Generate Certificate
          </Button>
        </div>

        {/* Dynamic section split */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* EARNED CERTIFICATES (2/3) */}
            <div className="lg:col-span-3 space-y-6">
            <h3 className="font-extrabold text-lg text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Earned Certificates
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {certificates.length > 0 ? certificates.map((cert, i) => (
                <Card
                  key={cert.certificate_id}
                  className="bento-tile p-5 flex flex-col justify-between border-gray-100 shadow-soft bg-white/95"
                  data-testid={`cert-card-${i}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
                        <Award className="w-6 h-6" />
                      </div>
                      <QrCode className="w-10 h-10 text-gray-200" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-800 leading-snug">{cert.course_name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Recipient: {cert.user_name}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-gray-50/50 p-2.5 rounded-xl border border-gray-50 text-center">
                      <div>
                        <p className="font-black text-xs text-indigo-600">{Math.round(cert.academic_score)}%</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Acad</p>
                      </div>
                      <div>
                        <p className="font-black text-xs text-cyan-600">{Math.round(cert.coding_score)}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Code</p>
                      </div>
                      <div>
                        <p className="font-black text-xs text-purple-600">#{cert.overall_rank}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Rank</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
                    <Button variant="outline" size="sm" className="flex-1 h-8 rounded-lg text-[10px] font-bold border-gray-200" asChild>
                      <a
                        href={`${API}/certificates/verify/${cert.verification_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 h-8 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => downloadCertificate(cert)} data-testid={`download-cert-${i}`}>
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                </Card>
              )) : (
                <div className="col-span-2 text-center py-16 bg-white/80 border border-dashed border-gray-200 rounded-[32px] p-6">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-500">No certificates earned yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto">
                    Complete assigned quizzes and coding benchmarks to unlock certificate credentials.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      <FloatingAIButton />
    </div>
  );
}
