import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(questionId: number | null) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevQuestionId = useRef<number | null>(null);

  // Reset timer when question changes
  useEffect(() => {
    if (questionId !== prevQuestionId.current) {
      setSeconds(0);
      setIsRunning(true);
      prevQuestionId.current = questionId;
    }
  }, [questionId]);

  // Timer tick
  useEffect(() => {
    if (isRunning && questionId !== null) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, questionId]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(() => setSeconds(0), []);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    seconds,
    isRunning,
    pause,
    resume,
    reset,
    formattedTime: formatTime(seconds),
    isWarning: seconds >= 120 && seconds < 180,
    isDanger: seconds >= 180,
  };
}
