import { useEffect, useRef } from 'react';
import { Question } from '@/types/question';
import { Input } from '@/components/ui/input';
import { Bookmark, Flag } from 'lucide-react';
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
  }, [question]);

  const animationClass = animationDirection === 'right' 
    ? 'animate-slide-in-right' 
    : animationDirection === 'left' 
    ? 'animate-slide-in-left' 
    : 'animate-fade-in';

  return (
    <div 
      ref={cardRef}
      className={cn("bg-card rounded-lg border border-border", animationClass)}
    >
      {/* Question Header - Bluebook Style */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b border-border rounded-t-lg">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-foreground text-background font-bold text-sm">
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
            <Bookmark className={cn("w-4 h-4", isMarkedForReview && "fill-current")} />
            {isMarkedForReview ? "Marked for Review" : "Mark for Review"}
          </button>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Flag className="w-4 h-4" />
          Report
        </button>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Question Text */}
        <div 
          className="text-foreground text-lg leading-relaxed mb-8 text-center"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />

        {/* Answer Options */}
        {question.type === 'mcq' && question.options && question.options.length > 0 ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === letter;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <button
                    onClick={() => onAnswerSelect(letter)}
                    className={cn(
                      "flex-1 flex items-center gap-4 px-4 py-3 rounded-lg border-2 transition-all duration-180 text-left",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-foreground text-foreground"
                    )}>
                      {letter}
                    </span>
                    <span 
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
                  </button>
                  {/* Side letter indicator like Bluebook */}
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                  )}>
                    {letter}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Input
              ref={inputRef}
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Answer"
              className="text-lg h-12 rounded-full border-2 text-center"
            />
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