'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, durationMs: number) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onCancelRecording: () => void;
}

export function AudioRecorder({
  onRecordingComplete,
  isRecording,
  onStartRecording,
  onCancelRecording,
}: AudioRecorderProps) {
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const durationMs = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, durationMs);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      onStartRecording();

      // Update duration counter
      intervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [onRecordingComplete, onStartRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDuration(0);
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDuration(0);
    onCancelRecording();
  }, [onCancelRecording]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-black/5 px-4 py-3 dark:bg-black/90"
    >
      {/* Cancel */}
      <button
        onClick={cancelRecording}
        className="text-red-500 text-sm"
      >
        ← Slide to cancel
      </button>

      {/* Duration + Recording indicator */}
      <div className="flex flex-1 items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-[14px] font-mono text-gray-700 dark:text-white/90">
          {formatTime(duration)}
        </span>
      </div>

      {/* Stop & Send */}
      <button
        onClick={stopRecording}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A84FF] text-white"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </motion.div>
  );
}
