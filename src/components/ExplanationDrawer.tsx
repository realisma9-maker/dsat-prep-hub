import { useEffect, useRef } from 'react';
import { X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  answer: string;
}

export function ExplanationDrawer({ isOpen, onClose, explanation, answer }: ExplanationDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Render LaTeX when content changes
  useEffect(() => {
    if (isOpen && window.MathJax && contentRef.current) {
      window.MathJax.typesetPromise?.([contentRef.current]);
    }
  }, [isOpen, explanation]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl",
        "transform transition-transform duration-300 ease-out",
        "max-h-[70vh] overflow-hidden flex flex-col",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Explanation</h3>
              <p className="text-sm text-muted-foreground">
                Correct Answer: <span className="font-medium text-success">{answer}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6"
        >
          <div 
            className="text-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: explanation || 'Explanation not added yet.' 
            }}
          />
        </div>
      </div>
    </>
  );
}
