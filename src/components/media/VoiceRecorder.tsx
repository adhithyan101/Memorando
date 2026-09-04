import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadVoiceNote } from '../../services/cloudinary';
import { VoiceNote } from '../../types';

interface VoiceRecorderProps {
  onVoiceNoteRecorded: (note: VoiceNote | null) => void;
  existingVoiceNote?: VoiceNote | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onVoiceNoteRecorded, 
  existingVoiceNote 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingVoiceNote?.secureUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [voiceNote, setVoiceNote] = useState<VoiceNote | null>(existingVoiceNote || null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Upload to Cloudinary
        try {
          setUploading(true);
          const uploaded = await uploadVoiceNote(audioBlob, recordingTime, (percent) => {
            setUploadProgress(percent);
          });
          setVoiceNote(uploaded);
          onVoiceNoteRecorded(uploaded);
        } catch (err: any) {
          setError('Failed to upload voice note. Please try again.');
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop stream tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRemove = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl(null);
    setVoiceNote(null);
    onVoiceNoteRecorded(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-bg-light dark:bg-bg-dark border border-sand dark:border-sand-dark space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate dark:text-slate-dark flex items-center space-x-1.5">
          <Mic className="w-4 h-4 text-terracotta" />
          <span>Voice Memory Note</span>
        </label>
        {recordingTime > 0 && (
          <span className="text-xs font-mono text-terracotta font-semibold">
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* RECORDING / CONTROLS STATE */}
      {!audioUrl && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-3 bg-card-light dark:bg-card-dark hover:bg-peach/10 border border-dashed border-terracotta/40 rounded-xl text-xs font-medium text-terracotta flex items-center justify-center space-x-2 transition"
        >
          <Mic className="w-4 h-4" />
          <span>Tap to Record Voice Note</span>
        </button>
      )}

      {isRecording && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">Recording audio...</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            title="Stop Recording"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate dark:text-slate-dark">
            <span>Uploading voice note...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-sand rounded-full overflow-hidden">
            <div 
              className="h-full bg-terracotta transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {audioUrl && !uploading && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-hover transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-medium text-charcoal dark:text-charcoal-dark">Voice Note Attached</p>
              <p className="text-[10px] text-slate dark:text-slate-dark">Ready to preserve</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate hover:text-red-500 rounded-lg transition"
            title="Delete Voice Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
