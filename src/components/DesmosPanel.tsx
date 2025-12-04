import { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, Maximize2, Minimize2, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// Desmos API Key
const DESMOS_API_KEY = 'dbf7cee828ed4d9fb809d780f559cab6';

interface DesmosPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DesmosPanel({ isCollapsed, onToggleCollapse }: DesmosPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 450, height: 400 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);

  // Load Desmos API script
  useEffect(() => {
    if (!document.getElementById('desmos-api-script')) {
      const script = document.createElement('script');
      script.id = 'desmos-api-script';
      script.src = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${DESMOS_API_KEY}`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize calculator when panel opens
  useEffect(() => {
    if (isCollapsed || !calculatorRef.current) return;

    const initCalculator = () => {
      if ((window as any).Desmos && calculatorRef.current && !calculatorInstance.current) {
        calculatorInstance.current = (window as any).Desmos.GraphingCalculator(calculatorRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true,
          pointsOfInterest: true,
          trace: true,
          border: false,
          lockViewport: false,
          fontSize: 16,
        });
      }
    };

    // Wait for Desmos to load
    if ((window as any).Desmos) {
      initCalculator();
    } else {
      const checkDesmos = setInterval(() => {
        if ((window as any).Desmos) {
          initCalculator();
          clearInterval(checkDesmos);
        }
      }, 100);
      return () => clearInterval(checkDesmos);
    }

    return () => {
      if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
      }
    };
  }, [isCollapsed]);

  // Resize calculator when size changes
  useEffect(() => {
    if (calculatorInstance.current && !isResizing) {
      calculatorInstance.current.resize();
    }
  }, [size, isFullscreen, isResizing]);

  // Smooth drag handler with RAF
  const handleDrag = useCallback((e: MouseEvent) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStart.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height - 100, dragStart.current.posY + dy));
      setPosition({ x: newX, y: newY });
    });
  }, [size]);

  // Smooth resize handler with RAF
  const handleResize = useCallback((e: MouseEvent) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(320, Math.min(900, resizeStart.current.width + dx)),
        height: Math.max(280, Math.min(700, resizeStart.current.height + dy)),
      });
    });
  }, []);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseUp = () => {
      setIsResizing(false);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      // Resize calculator after resize completes
      if (calculatorInstance.current) {
        calculatorInstance.current.resize();
      }
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleResize]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { 
      x: e.clientX, 
      y: e.clientY, 
      posX: position.x, 
      posY: position.y 
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = { 
      width: size.width, 
      height: size.height, 
      x: e.clientX, 
      y: e.clientY 
    };
  };

  if (isCollapsed) return null;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background animate-fade-in">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
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
          <div ref={calculatorRef} className="flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-card rounded-lg border border-border shadow-xl z-40 overflow-hidden desmos-panel",
        isDragging && "dragging",
        isResizing && "resizing"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50 cursor-grab active:cursor-grabbing select-none"
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
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calculator */}
      <div 
        ref={calculatorRef} 
        style={{ height: size.height }}
        className="bg-white"
      />

      {/* Resize handle - larger hit area */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full text-muted-foreground" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}