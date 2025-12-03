import { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  Lightbulb,
  Calculator,
  FileText,
  Maximize2,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const { formattedTime, isWarning, isDanger, reset: resetTimer, pause, resume, isRunning } = useTimer(currentQuestion?.id ?? null);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showDesmos, setShowDesmos] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

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

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      {/* Top Bar - Bluebook Style */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToTopics}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Back to Topics"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">
                SAT® Suite Question Bank
              </h1>
              <button className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
                Directions <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Center Section - Timer */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "font-mono text-2xl font-bold tabular-nums",
              isWarning && "text-timer-warning",
              isDanger && "text-timer-danger animate-pulse"
            )}>
              {formattedTime}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => isRunning ? pause() : resume()}
                className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
                title={isRunning ? "Pause" : "Resume"}
              >
                <Pause className="w-4 h-4" />
              </button>
              <button 
                className="px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors text-sm font-medium"
              >
                Hide
              </button>
            </div>
          </div>

          {/* Right Section - Tools */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDesmos(!showDesmos)}
              className={cn(
                "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors",
                showDesmos && "text-primary"
              )}
            >
              <Calculator className="w-5 h-5" />
              <span className="text-xs hidden sm:block">Calculator</span>
            </button>
            <button 
              onClick={() => setShowReference(!showReference)}
              className={cn(
                "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors",
                showReference && "text-primary"
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs hidden sm:block">Reference</span>
            </button>
            <button 
              onClick={toggleFullscreen}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
              <span className="text-xs hidden sm:block">Fullscreen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Landscape Layout */}
      <main className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 w-full max-w-5xl mx-auto px-6 lg:px-12 py-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswerSelect={(answer) => setAnswer(currentQuestion.id, answer)}
            isMarkedForReview={markedForReview.includes(currentQuestion.id)}
            onToggleMarkForReview={() => toggleMarkForReview(currentQuestion.id)}
            animationDirection={animationDirection}
          />
        </div>

        {/* Desmos Panel Overlay */}
        {showDesmos && (
          <DesmosPanel
            isCollapsed={false}
            onToggleCollapse={() => setShowDesmos(false)}
          />
        )}

        {/* Reference Panel Overlay */}
        {showReference && (
          <ReferencePanel
            imageUrl={currentQuestion.referenceImage}
            isCollapsed={false}
            onToggleCollapse={() => setShowReference(false)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar - Bluebook Style */}
      <footer className="bg-card border-t border-border sticky bottom-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left - Question Number Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuestionList(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {currentIndex + 1} of {totalQuestions}
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all progress for this topic?')) {
                  resetProgress();
                }
              }}
              className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              title="Reset Progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
              <Info className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Lightbulb className="w-4 h-4" />
              Explanation
            </button>

            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 rounded-full border border-border hover:bg-secondary transition-colors font-medium text-sm"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="px-4 py-2 rounded-full border border-border hover:bg-secondary transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* SAT Disclaimer */}
        <div className="text-center pb-2">
          <p className="text-xs text-muted-foreground">
            SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
          </p>
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