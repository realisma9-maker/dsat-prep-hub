import { useState, useMemo } from 'react';
import { X, Flag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface QuestionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  markedForReview: number[];
  onSelectQuestion: (index: number) => void;
}

const ITEMS_PER_PAGE = 20;

export function QuestionListModal({
  isOpen,
  onClose,
  questions,
  currentIndex,
  answers,
  markedForReview,
  onSelectQuestion,
}: QuestionListModalProps) {
  const [page, setPage] = useState(0);
  
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  
  const visibleQuestions = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return questions.slice(start, start + ITEMS_PER_PAGE);
  }, [questions, page]);

  const startIndex = page * ITEMS_PER_PAGE;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] z-50 bg-card rounded-xl shadow-2xl border border-border flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">Question Navigator</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Marked</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {visibleQuestions.map((question, idx) => {
              const globalIndex = startIndex + idx;
              const isCurrent = globalIndex === currentIndex;
              const isAnswered = answers[question.id] !== undefined;
              const isMarked = markedForReview.includes(question.id);

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    onSelectQuestion(globalIndex);
                    onClose();
                  }}
                  className={cn(
                    "relative aspect-square rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-180 hover:scale-105",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isCurrent && isAnswered && "bg-success/20 text-success border border-success/30",
                    !isCurrent && !isAnswered && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {globalIndex + 1}
                  {isMarked && (
                    <Flag className="absolute -top-1 -right-1 w-3 h-3 text-primary" />
                  )}
                  {isAnswered && !isCurrent && (
                    <Check className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-success" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
