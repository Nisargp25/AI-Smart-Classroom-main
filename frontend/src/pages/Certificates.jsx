import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Award,
  Download,
  CheckCircle2,
  QrCode,
  Trophy,
  Calendar,
  FileText,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

  // Top-left blue corner ribbons
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(320, 0);
  ctx.lineTo(0, 210);
  ctx.closePath();
  ctx.fillStyle = '#2c3fe1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(280, 0);
  ctx.lineTo(0, 170);
  ctx.closePath();
  ctx.fillStyle = '#1a2fb8';
  ctx.fill();

  // Bottom-right blue corner ribbons
  ctx.beginPath();
  ctx.moveTo(width, height);
  ctx.lineTo(width - 340, height);
  ctx.lineTo(width, height - 220);
  ctx.closePath();
  ctx.fillStyle = '#2c3fe1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, height);
  ctx.lineTo(width - 300, height);
  ctx.lineTo(width, height - 180);
  ctx.closePath();
  ctx.fillStyle = '#1a2fb8';
  ctx.fill();

  // Center wave lines
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

  // Heading
  ctx.fillStyle = '#173f38';
  ctx.font = 'bold 78px Georgia';
  ctx.fillText('CERTIFICATE', centerX, 165);

  ctx.font = '52px Georgia';
  ctx.fillText('OF APPRECIATION', centerX, 232);

  // Recipient section
  ctx.fillStyle = '#1f4740';
  ctx.font = '48px Georgia';
  ctx.fillText('This certificate is proudly presented to:', centerX, 306);

  ctx.fillStyle = '#1f5a4f';
  ctx.font = 'italic 86px "Brush Script MT", "Times New Roman", serif';
  ctx.fillText(cert.user_name || 'Student Name', centerX, 398);

  ctx.beginPath();
  ctx.moveTo(305, 430);
  ctx.lineTo(895, 430);
  ctx.strokeStyle = '#b59c72';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Detail copy
  ctx.fillStyle = '#23453f';
  ctx.font = '34px Arial';
  const detailText = `For outstanding work in ${cert.course_name || 'CampusAi Capstone Program'}`;
  ctx.fillText(detailText, centerX, 492);

  const scoreLine = `Academic ${Math.round(cert.academic_score || 0)}%   |   Coding ${Math.round(cert.coding_score || 0)}   |   Rank #${cert.overall_rank || '-'}`;
  ctx.font = '30px Arial';
  ctx.fillText(scoreLine, centerX, 538);

  const issuedOn = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = '26px Arial';
  ctx.fillText(`Issued on ${issuedOn}`, centerX, 580);

  // Signature area
  ctx.fillStyle = '#21594f';
  ctx.font = 'italic 72px "Brush Script MT", "Times New Roman", serif';
  ctx.fillText('Signature', centerX, 690);
  ctx.font = 'bold 48px Georgia';
  ctx.fillText('CampusAi Manager', centerX, 748);

  // Verification id
  ctx.font = '22px monospace';
  ctx.fillStyle = '#3c5f59';
  ctx.fillText(`Verification ID: ${cert.verification_code}`, centerX, 794);

  // Gold seal (bottom-right)
  const sealX = 980;
  const sealY = 730;
  const rays = 18;
  for (let i = 0; i < rays; i += 1) {
    const angle = (Math.PI * 2 * i) / rays;
    const x1 = sealX + Math.cos(angle) * 42;
    const y1 = sealY + Math.sin(angle) * 42;
    const x2 = sealX + Math.cos(angle + 0.08) * 58;
    const y2 = sealY + Math.sin(angle + 0.08) * 58;
    const x3 = sealX + Math.cos(angle - 0.08) * 58;
    const y3 = sealY + Math.sin(angle - 0.08) * 58;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = '#f0ba18';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(sealX, sealY, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd74f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 31, 0, Math.PI * 2);
  ctx.fillStyle = '#f6c218';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 27, 0, Math.PI * 2);
  ctx.fillStyle = '#fff0a4';
  ctx.fill();

  // Seal ribbons
  ctx.beginPath();
  ctx.moveTo(sealX - 18, sealY + 34);
  ctx.lineTo(sealX - 54, sealY + 112);
  ctx.lineTo(sealX - 10, sealY + 92);
  ctx.fillStyle = '#f5c62c';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sealX + 18, sealY + 34);
  ctx.lineTo(sealX + 54, sealY + 112);
  ctx.lineTo(sealX + 10, sealY + 92);
  ctx.fillStyle = '#f3bd20';
  ctx.fill();

  // Download
  const link = document.createElement('a');
  link.download = `certificate-${cert.verification_code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast.success('Certificate downloaded!');
};

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
      setCertificates(response.data);
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
    <div className="min-h-screen bg-background" data-testid="certificates-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              Certificates
            </h1>
            <p className="text-muted-foreground">Your achievements and certifications</p>
          </div>
          <Button onClick={generateCertificate} disabled={generating} data-testid="generate-cert-btn">
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate Certificate
          </Button>
        </div>

        {/* Certificates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.length > 0 ? certificates.map((cert, i) => (
            <Card
              key={cert.certificate_id}
              className="card-hover animate-fade-in overflow-hidden"
              style={{ animationDelay: `${i * 0.1}s` }}
              data-testid={`cert-card-${i}`}
            >
              {/* Certificate Preview */}
              <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 p-6 border-b">
                <div className="absolute top-4 right-4">
                  <QrCode className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-lg">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-lg">Certificate of Appreciation</h3>
                <p className="text-center text-sm text-muted-foreground mt-1">{cert.course_name}</p>
              </div>

              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <p className="font-semibold text-lg">{cert.user_name}</p>
                  <p className="text-sm text-muted-foreground">has successfully completed the course</p>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold text-primary">{Math.round(cert.academic_score)}%</p>
                    <p className="text-xs text-muted-foreground">Academic</p>
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{Math.round(cert.coding_score)}</p>
                    <p className="text-xs text-muted-foreground">Coding</p>
                  </div>
                  <div>
                    <p className="font-bold">#{cert.overall_rank}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Verified
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a
                      href={`${API}/certificates/verify/${cert.verification_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Verify
                    </a>
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => downloadCertificate(cert)} data-testid={`download-cert-${i}`}>
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  ID: {cert.verification_code}
                </p>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No certificates yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Complete courses and quizzes to earn certificates
              </p>
              <Button onClick={generateCertificate} disabled={generating}>
                Generate Your First Certificate
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
