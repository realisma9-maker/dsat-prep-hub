import { useState, useEffect, useCallback } from 'react';
import { Question, UserProgress } from '@/types/question';

const STORAGE_KEY = 'dsat-progress';

export function useQuestions(topic: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);

  // Load questions from JSON file
  const loadQuestions = useCallback(async (topicId: string) => {
    setLoading(true);
    try {
      const fileMap: Record<string, string> = {
        algebra: '/data/algebra.json',
        advanced_math: '/data/advanced_math.json',
        problem_solving: '/data/problem_solving.json',
        geometry: '/data/geometry.json',
      };

      const response = await fetch(fileMap[topicId]);
      const data = await response.json();
      
      // Helper to clean up extra newlines and whitespace
      const cleanText = (text: string): string => {
        if (!text) return text;
        return text
          .replace(/\\n/g, ' ')  // Replace literal \n
          .replace(/\n+/g, ' ')  // Replace actual newlines
          .replace(/\s+/g, ' ')  // Collapse multiple spaces
          .trim();
      };

      // Normalize the data structure
      const normalized: Question[] = data.map((item: any, idx: number) => {
        // Determine question type
        const hasOptions = item.options || item.choices;
        const type = item.type === 'numeric' || (!hasOptions || (hasOptions && hasOptions.length === 0)) 
          ? 'free-response' 
          : 'mcq';
        
        // Clean options too
        const options = (item.options || item.choices || []).map((opt: string) => cleanText(opt));
        
        return {
          id: item.id || item.number || item.geometry_number || idx + 1,
          question: cleanText(item.question),
          type,
          options,
          answer: item.answer,
          explanation: item.explanation || 'Explanation not added yet.',
          topic: topicId,
        };
      });

      setQuestions(normalized);
      
      // Load saved progress
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress: Record<string, UserProgress> = JSON.parse(saved);
        if (progress[topicId]) {
          setCurrentIndex(progress[topicId].currentIndex || 0);
          setAnswers(progress[topicId].answers || {});
          setMarkedForReview(progress[topicId].markedForReview || []);
        } else {
          setCurrentIndex(0);
          setAnswers({});
          setMarkedForReview([]);
        }
      } else {
        setCurrentIndex(0);
        setAnswers({});
        setMarkedForReview([]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (!topic) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    const progress: Record<string, UserProgress> = saved ? JSON.parse(saved) : {};
    
    progress[topic] = {
      topic,
      currentIndex,
      answers,
      markedForReview,
      timeSpent: {},
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [topic, currentIndex, answers, markedForReview]);

  // Auto-save on changes
  useEffect(() => {
    if (topic && questions.length > 0) {
      saveProgress();
    }
  }, [currentIndex, answers, markedForReview, saveProgress, topic, questions.length]);

  // Load questions when topic changes
  useEffect(() => {
    if (topic) {
      loadQuestions(topic);
    }
  }, [topic, loadQuestions]);

  const currentQuestion = questions[currentIndex] || null;

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const setAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const toggleMarkForReview = useCallback((questionId: number) => {
    setMarkedForReview(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const resetProgress = useCallback(() => {
    if (!topic) return;
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview([]);
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const progress: Record<string, UserProgress> = JSON.parse(saved);
      delete progress[topic];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [topic]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    loading,
    answers,
    markedForReview,
    goToNext,
    goToPrevious,
    goToQuestion,
    setAnswer,
    toggleMarkForReview,
    resetProgress,
    totalQuestions: questions.length,
  };
}
