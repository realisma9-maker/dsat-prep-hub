import { useState } from 'react';
import { Image, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencePanelProps {
  imageUrl?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ReferencePanel({ imageUrl, isCollapsed, onToggleCollapse }: ReferencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show placeholder if no image
  const hasImage = !!imageUrl;

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="panel-collapsible p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors w-full"
      >
        <Image className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">Reference Image</span>
        {!hasImage && (
          <span className="text-xs text-muted-foreground ml-auto">No image</span>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="panel-collapsible">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Reference</span>
          </div>
          <div className="flex items-center gap-1">
            {hasImage && (
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {hasImage ? (
            <img
              src={imageUrl}
              alt="Reference"
              className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsExpanded(true)}
            />
          ) : (
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No reference image for this question</p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded View Modal */}
      {isExpanded && hasImage && (
        <>
          <div 
            className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setIsExpanded(false)}
          />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute -top-12 right-0 p-2 rounded-lg bg-card hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={imageUrl}
                alt="Reference (expanded)"
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
