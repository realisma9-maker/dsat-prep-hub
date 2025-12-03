import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { useTimer } from '@/hooks/useTimer';
import { QuestionCard } from './QuestionCard';
import { DesmosPanel } from './DesmosPanel';
import { ReferencePanel } from './ReferencePanel';
import { ExplanationDrawer } from './ExplanationDrawer';
import { QuestionListModal } from './QuestionListModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Home, 
  Clock, 
  List,
  RotateCcw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeViewProps {
  topic: string;
  topicName: string;
  onBackToTopics: () => void;
}

export function PracticeView({ topic, topicName, onBackToTopics }: PracticeViewProps) {
  const {
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
    totalQuestions,
  } = useQuestions(topic);

  const { formattedTime, isWarning, isDanger, reset: resetTimer } = useTimer(currentQuestion?.id ?? null);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [desmosCollapsed, setDesmosCollapsed] = useState(false);
  const [referenceCollapsed, setReferenceCollapsed] = useState(true);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  // Auto-collapse panels on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setDesmosCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'n':
          handleNext();
          break;
        case 'ArrowLeft':
        case 'p':
          handlePrevious();
          break;
        case 'a':
        case 'b':
        case 'c':
        case 'd':
          if (currentQuestion?.type === 'mcq') {
            const letter = e.key.toUpperCase();
            const optionCount = currentQuestion.options?.length || 0;
            const letterIndex = letter.charCodeAt(0) - 65;
            if (letterIndex < optionCount) {
              setAnswer(currentQuestion.id, letter);
            }
          }
          break;
        case 'e':
          setShowExplanation(prev => !prev);
          break;
        case 'l':
          setShowQuestionList(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, setAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setAnimationDirection('right');
      goToNext();
      resetTimer();
    }
  }, [currentIndex, totalQuestions, goToNext, resetTimer]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setAnimationDirection('left');
      goToPrevious();
      resetTimer();
    }
  }, [currentIndex, goToPrevious, resetTimer]);

  const handleSelectQuestion = useCallback((index: number) => {
    setAnimationDirection(index > currentIndex ? 'right' : 'left');
    goToQuestion(index);
    resetTimer();
  }, [currentIndex, goToQuestion, resetTimer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No questions found for this topic.</p>
          <button onClick={onBackToTopics} className="nav-button bg-primary text-primary-foreground">
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToTopics}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Back to Topics"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-foreground text-sm md:text-base">
                Top 150 Hardest Math for DSAT
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {topicName} — Confidence Boost Collection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={cn(
              "timer-display flex items-center gap-2",
              isWarning && "timer-warning",
              isDanger && "timer-danger"
            )}>
              <Clock className="w-4 h-4" />
              {formattedTime}
            </div>

            {/* Question Indicator */}
            <button
              onClick={() => setShowQuestionList(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="font-medium text-sm">
                {currentIndex + 1} of {totalQuestions}
              </span>
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm('Reset all progress for this topic?')) {
                  resetProgress();
                }
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Reset Progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Card - Left Side */}
          <div className="flex-1 lg:max-w-3xl">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswerSelect={(answer) => setAnswer(currentQuestion.id, answer)}
              isMarkedForReview={markedForReview.includes(currentQuestion.id)}
              onToggleMarkForReview={() => toggleMarkForReview(currentQuestion.id)}
              animationDirection={animationDirection}
            />
          </div>

          {/* Side Panels - Right Side */}
          <div className="lg:w-80 space-y-4">
            <DesmosPanel
              isCollapsed={desmosCollapsed}
              onToggleCollapse={() => setDesmosCollapsed(!desmosCollapsed)}
            />
            <ReferencePanel
              imageUrl={currentQuestion.referenceImage}
              isCollapsed={referenceCollapsed}
              onToggleCollapse={() => setReferenceCollapsed(!referenceCollapsed)}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="bg-card border-t border-border sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowExplanation(true)}
            className="nav-button bg-secondary text-secondary-foreground flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Explanation</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="nav-button bg-secondary text-secondary-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="nav-button bg-primary text-primary-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Explanation Drawer */}
      <ExplanationDrawer
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={currentQuestion.explanation}
        answer={currentQuestion.answer}
      />

      {/* Question List Modal */}
      <QuestionListModal
        isOpen={showQuestionList}
        onClose={() => setShowQuestionList(false)}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        markedForReview={markedForReview}
        onSelectQuestion={handleSelectQuestion}
      />
    </div>
  );
}
