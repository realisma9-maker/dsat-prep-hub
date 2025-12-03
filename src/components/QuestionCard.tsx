import { useEffect, useRef, useState } from 'react';
import { Question } from '@/types/question';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bookmark, Flag, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answer: string) => void;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
  animationDirection: 'left' | 'right' | null;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  isMarkedForReview,
  onToggleMarkForReview,
  animationDirection,
}: QuestionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChecked, setIsChecked] = useState(false);

  // Reset checked state when question changes
  useEffect(() => {
    setIsChecked(false);
  }, [question.id]);

  // Focus input for free response
  useEffect(() => {
    if (question.type === 'free-response' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id, question.type]);

  // Render LaTeX
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.([cardRef.current]);
    }
  }, [question, isChecked]);

  const isCorrect = selectedAnswer?.toUpperCase().trim() === question.answer?.toUpperCase().trim();

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsChecked(true);
    }
  };

  const animationClass = animationDirection === 'right' 
    ? 'animate-slide-in-right' 
    : animationDirection === 'left' 
    ? 'animate-slide-in-left' 
    : 'animate-fade-in';

  return (
    <div 
      ref={cardRef}
      className={cn("bg-card rounded-lg border border-border shadow-sm", animationClass)}
    >
      {/* Question Header - Bluebook Style */}
      <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border rounded-t-lg">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-9 h-9 rounded bg-foreground text-background font-bold text-base">
            {questionNumber}
          </span>
          <button
            onClick={onToggleMarkForReview}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              isMarkedForReview 
                ? "text-destructive" 
                : "text-foreground hover:text-primary"
            )}
          >
            <Bookmark className={cn("w-5 h-5", isMarkedForReview && "fill-current")} />
            {isMarkedForReview ? "Marked for Review" : "Mark for Review"}
          </button>
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Flag className="w-4 h-4" />
          Report
        </button>
      </div>

      {/* Question Content - Landscape Layout */}
      <div className="p-8">
        {/* Question Text - Horizontal flow with inline math */}
        <div 
          className="question-text text-foreground text-base mb-8 max-w-4xl"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />

        {/* Answer Options */}
        {question.type === 'mcq' && question.options && question.options.length > 0 ? (
          <div className="space-y-3 max-w-3xl">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === letter;
              const isCorrectOption = letter === question.answer?.toUpperCase().trim();
              const showCorrectFeedback = isChecked && isCorrectOption;
              const showIncorrectFeedback = isChecked && isSelected && !isCorrectOption;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <button
                    onClick={() => !isChecked && onAnswerSelect(letter)}
                    disabled={isChecked}
                    className={cn(
                      "flex-1 flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-180 text-left",
                      showCorrectFeedback
                        ? "border-green-500 bg-green-500/10"
                        : showIncorrectFeedback
                        ? "border-destructive bg-destructive/10"
                        : isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/40 hover:bg-muted/30",
                      isChecked && "cursor-default"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full border-2 font-semibold text-sm shrink-0 transition-colors",
                      showCorrectFeedback
                        ? "bg-green-500 text-white border-green-500"
                        : showIncorrectFeedback
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-foreground text-foreground"
                    )}>
                      {showCorrectFeedback ? <CheckCircle className="w-5 h-5" /> : showIncorrectFeedback ? <XCircle className="w-5 h-5" /> : letter}
                    </span>
                    <span 
                      className="option-text flex-1 text-base"
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
                  </button>
                  {/* Side indicator */}
                  <span className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors shrink-0",
                    showCorrectFeedback
                      ? "border-green-500 text-green-500"
                      : showIncorrectFeedback
                      ? "border-destructive text-destructive"
                      : isSelected
                      ? "border-primary text-primary"
                      : "border-muted-foreground/20 text-muted-foreground/30"
                  )}>
                    {letter}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-sm space-y-3">
            <Input
              ref={inputRef}
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => !isChecked && onAnswerSelect(e.target.value)}
              disabled={isChecked}
              placeholder="Answer"
              className={cn(
                "text-base h-12 rounded-full border-2 px-5",
                isChecked && isCorrect && "border-green-500 bg-green-500/10",
                isChecked && !isCorrect && "border-destructive bg-destructive/10"
              )}
            />
            {isChecked && !isCorrect && (
              <p className="text-sm text-green-600 font-medium">
                Correct answer: {question.answer}
              </p>
            )}
          </div>
        )}

        {/* Check Answer Button */}
        {!isChecked && selectedAnswer && (
          <div className="mt-6">
            <Button 
              onClick={handleCheckAnswer}
              className="bg-primary hover:bg-primary/90"
            >
              Check Answer
            </Button>
          </div>
        )}

        {/* Result Feedback */}
        {isChecked && (
          <div className={cn(
            "mt-6 p-4 rounded-lg border-2",
            isCorrect 
              ? "bg-green-500/10 border-green-500" 
              : "bg-destructive/10 border-destructive"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-600">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-destructive">Incorrect</span>
                </>
              )}
            </div>
            {/* Explanation */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Explanation:</p>
              <div 
                className="text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: question.explanation || 'Explanation not added yet.' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add MathJax types
declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}