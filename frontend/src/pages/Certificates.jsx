import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  Award,
  Download,
  CheckCircle2,
  QrCode,
  Trophy,
  Calendar,
  ExternalLink,
  Plus,
  Loader2,
  Lock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import API from '../lib/api';

export default function Certificates() {
  const { user } = useAuth();
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
        { course_name: 'CampusAi Capstone Program' },
        { withCredentials: true }
      );
      setCertificates(prev => [response.data, ...prev]);
      toast.success('Certificate generated!');
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

    // Base background
    ctx.fillStyle = '#f6f6f8';
    ctx.fillRect(0, 0, width, height);

    // Ribbons
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(320, 0); ctx.lineTo(0, 210); ctx.closePath();
    ctx.fillStyle = '#2c3fe1'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(280, 0); ctx.lineTo(0, 170); ctx.closePath();
    ctx.fillStyle = '#1a2fb8'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width - 340, height); ctx.lineTo(width, height - 220); ctx.closePath();
    ctx.fillStyle = '#2c3fe1'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width - 300, height); ctx.lineTo(width, height - 180); ctx.closePath();
    ctx.fillStyle = '#1a2fb8'; ctx.fill();

    for (let i = 0; i < 18; i += 1) {
      const yOffset = i * 5;
      const alpha = 0.07 + i * 0.01;
      ctx.beginPath();
      ctx.moveTo(90, 520 + yOffset);
      ctx.bezierCurveTo(280, 410 + yOffset, 440, 700 - yOffset, 650, 540 + yOffset);
      ctx.bezierCurveTo(790, 430 + yOffset, 920, 360 + yOffset, 1130, 420 + yOffset);
      ctx.strokeStyle = i % 2 === 0 ? `rgba(64, 206, 216, ${alpha})` : `rgba(234, 76, 195, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#173f38'; ctx.font = 'bold 78px Georgia'; ctx.fillText('CERTIFICATE', centerX, 165);
    ctx.font = '52px Georgia'; ctx.fillText('OF APPRECIATION', centerX, 232);
    ctx.fillStyle = '#1f4740'; ctx.font = '48px Georgia'; ctx.fillText('This certificate is proudly presented to:', centerX, 306);
    ctx.fillStyle = '#1f5a4f'; ctx.font = 'italic 86px "Brush Script MT", "Times New Roman", serif'; ctx.fillText(cert.user_name || 'Student Name', centerX, 398);

    ctx.beginPath(); ctx.moveTo(305, 430); ctx.lineTo(895, 430); ctx.strokeStyle = '#b59c72'; ctx.lineWidth = 3; ctx.stroke();

    ctx.fillStyle = '#23453f'; ctx.font = '34px Arial'; ctx.fillText(`For outstanding work in ${cert.course_name || 'CampusAi Capstone Program'}`, centerX, 492);
    ctx.font = '30px Arial'; ctx.fillText(`Academic ${Math.round(cert.academic_score || 0)}%   |   Coding ${Math.round(cert.coding_score || 0)}   |   Rank #${cert.overall_rank || '-'}`, centerX, 538);
    const issuedOn = new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '26px Arial'; ctx.fillText(`Issued on ${issuedOn}`, centerX, 580);

    ctx.fillStyle = '#21594f'; ctx.font = 'italic 72px "Brush Script MT", "Times New Roman", serif'; ctx.fillText('Signature', centerX, 690);
    ctx.font = 'bold 48px Georgia'; ctx.fillText('CampusAi Manager', centerX, 748);
    ctx.font = '22px monospace'; ctx.fillStyle = '#3c5f59'; ctx.fillText(`Verification ID: ${cert.verification_code}`, centerX, 794);

    const sealX = 980; const sealY = 730; const rays = 18;
    for (let i = 0; i < rays; i += 1) {
      const angle = (Math.PI * 2 * i) / rays;
      const x1 = sealX + Math.cos(angle) * 42; const y1 = sealY + Math.sin(angle) * 42;
      const x2 = sealX + Math.cos(angle + 0.08) * 58; const y2 = sealY + Math.sin(angle + 0.08) * 58;
      const x3 = sealX + Math.cos(angle - 0.08) * 58; const y3 = sealY + Math.sin(angle - 0.08) * 58;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
      ctx.fillStyle = '#f0ba18'; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(sealX, sealY, 42, 0, Math.PI * 2); ctx.fillStyle = '#ffd74f'; ctx.fill();
    ctx.beginPath(); ctx.arc(sealX, sealY, 31, 0, Math.PI * 2); ctx.fillStyle = '#f6c218'; ctx.fill();
    ctx.beginPath(); ctx.arc(sealX, sealY, 27, 0, Math.PI * 2); ctx.fillStyle = '#fff0a4'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(sealX - 18, sealY + 34); ctx.lineTo(sealX - 54, sealY + 112); ctx.lineTo(sealX - 10, sealY + 92); ctx.fillStyle = '#f5c62c'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(sealX + 18, sealY + 34); ctx.lineTo(sealX + 54, sealY + 112); ctx.lineTo(sealX + 10, sealY + 92); ctx.fillStyle = '#f3bd20'; ctx.fill();

    const link = document.createElement('a');
    link.download = `certificate-${cert.verification_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Certificate downloaded!');
  };

  const inProgressCerts = [
    { title: 'Data Structures Advanced certification', progress: 72, instruction: 'Complete the remaining stack & sorting quizzes to unlock.' }
  ];

  const availableCerts = [
    { title: 'Object Oriented Programming Certification', topic: 'OOP Mastery' }
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
            Generate Capstone Demo
          </Button>
        </div>

        {/* Dynamic section split */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* EARNED CERTIFICATES (2/3) */}
          <div className="lg:col-span-2 space-y-6">
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

          {/* IN PROGRESS & AVAILABLE (1/3) */}
          <div className="space-y-6">
            
            {/* In Progress */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-gray-800">In Progress</h3>
              {inProgressCerts.map((c, idx) => (
                <Card key={idx} className="bento-tile p-5 border-gray-100 shadow-soft bg-white/95 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-gray-700 leading-snug">{c.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{c.instruction}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <span>Milestone Progress</span>
                      <span className="text-indigo-600">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" indicatorClassName="bg-indigo-600" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Available Certifications */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-gray-800">Available Certifications</h3>
              {availableCerts.map((c, idx) => (
                <Card key={idx} className="bento-tile p-5 border-gray-100 shadow-soft bg-gray-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-100 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-600 leading-snug">{c.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Focus: {c.topic}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </div>

        </div>

      </main>

      <FloatingAIButton />
    </div>
  );
}
