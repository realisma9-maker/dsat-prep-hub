import { useEffect, useRef } from 'react';
import { Question } from '@/types/question';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Flag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answer: string) => void;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
  animationDirection: 'left' | 'right' | null;
}

export function QuestionCard({
  question,
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
      className={cn("question-card", animationClass)}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Question {question.id}
          </span>
          {question.type === 'free-response' && (
            <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded">
              Free Response
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMarkForReview}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-180",
              isMarkedForReview 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            Mark for Review
          </button>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div 
        className="text-foreground text-lg leading-relaxed mb-8"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />

      {/* Answer Options */}
      {question.type === 'mcq' && question.options && question.options.length > 0 ? (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === letter;
            
            return (
              <button
                key={index}
                onClick={() => onAnswerSelect(letter)}
                className={cn("option-button", isSelected && "selected")}
              >
                <span className="option-letter">{letter}</span>
                <span 
                  className="flex-1 pt-1"
                  dangerouslySetInnerHTML={{ __html: option }}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="max-w-md">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Your Answer
          </label>
          <Input
            ref={inputRef}
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            placeholder="Enter your answer"
            className="text-lg h-12"
          />
        </div>
      )}
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
