import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Pause, Play, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AudioRecorder({ onRecordingComplete, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
      toast.success('Recording stopped');
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
        setIsPaused(false);
        toast.info('Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
        setIsPaused(true);
        toast.info('Recording paused');
      }
    }
  }, [isRecording, isPaused]);

  const handleUpload = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    try {
      await onRecordingComplete(audioBlob, duration);
      setAudioBlob(null);
      setDuration(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload recording');
    } finally {
      setIsUploading(false);
    }
  }, [audioBlob, duration, onRecordingComplete]);

  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    toast.info('Recording discarded');
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl border" data-testid="audio-recorder">
      {/* Timer Display */}
      <div className="text-4xl font-mono font-bold tracking-wider" data-testid="recording-timer">
        {formatTime(duration)}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-sm text-muted-foreground">
            {isPaused ? 'Paused' : 'Recording...'}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !audioBlob && (
          <Button
            size="lg"
            onClick={startRecording}
            disabled={disabled}
            className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            data-testid="start-recording-btn"
          >
            <Mic className="w-6 h-6" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={pauseRecording}
              className="rounded-full w-14 h-14"
              data-testid="pause-recording-btn"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button
              size="lg"
              onClick={stopRecording}
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
              data-testid="stop-recording-btn"
            >
              <Square className="w-6 h-6" />
            </Button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              variant="outline"
              onClick={discardRecording}
              data-testid="discard-recording-btn"
            >
              Discard
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90"
              data-testid="upload-recording-btn"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Audio Preview */}
      {audioBlob && (
        <audio
          controls
          src={URL.createObjectURL(audioBlob)}
          className="w-full max-w-md mt-4"
          data-testid="audio-preview"
        />
      )}
    </div>
  );
}
