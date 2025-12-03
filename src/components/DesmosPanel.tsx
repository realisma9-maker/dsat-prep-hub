import { useState, useEffect, useRef } from 'react';
import { Calculator, Maximize2, Minimize2, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesmosPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DesmosPanel({ isCollapsed, onToggleCollapse }: DesmosPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 350 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(300, resizeStart.current.width + dx),
        height: Math.max(250, resizeStart.current.height + dy),
      });
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { 
      width: size.width, 
      height: size.height, 
      x: e.clientX, 
      y: e.clientY 
    };
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="panel-collapsible p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors w-full"
      >
        <Calculator className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">Graphing Calculator</span>
      </button>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Desmos Graphing Calculator</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <iframe
              src="https://www.desmos.com/calculator"
              className="w-full h-full border-0"
              title="Desmos Calculator"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "panel-collapsible",
        isDragging && "cursor-grabbing",
        !isFullscreen && "relative"
      )}
      style={
        position.x !== 0 || position.y !== 0
          ? {
              position: 'fixed',
              left: `calc(50% + ${position.x}px)`,
              top: `calc(50% + ${position.y}px)`,
              transform: 'translate(-50%, -50%)',
              width: size.width,
              zIndex: 40,
            }
          : { width: '100%' }
      }
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-border cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <Calculator className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calculator iframe */}
      <div style={{ height: size.height }}>
        <iframe
          src="https://www.desmos.com/calculator"
          className="w-full h-full border-0"
          title="Desmos Calculator"
        />
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <svg className="w-full h-full text-muted-foreground/50" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
        </svg>
      </div>
    </div>
  );
}
