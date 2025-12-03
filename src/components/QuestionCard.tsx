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
        {/* Question Text - Left aligned, proper reading width */}
        <div 
          className="text-foreground text-base leading-relaxed mb-8 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />

        {/* Answer Options */}
        {question.type === 'mcq' && question.options && question.options.length > 0 ? (
          <div className="space-y-3 max-w-3xl">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === letter;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <button
                    onClick={() => onAnswerSelect(letter)}
                    className={cn(
                      "flex-1 flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-180 text-left",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full border-2 font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-foreground text-foreground"
                    )}>
                      {letter}
                    </span>
                    <span 
                      className="flex-1 text-base"
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
                  </button>
                  {/* Side indicator */}
                  <span className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors shrink-0",
                    isSelected
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
          <div className="max-w-sm">
            <Input
              ref={inputRef}
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Answer"
              className="text-base h-12 rounded-full border-2 px-5"
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