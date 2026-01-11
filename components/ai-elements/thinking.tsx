
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Markdown } from './markdown';

interface ThinkingProps {
  children: string;
  elapsedTime?: string;
  defaultOpen?: boolean;
  className?: string;
}

export const Thinking: React.FC<ThinkingProps> = ({
  children,
  elapsedTime,
  defaultOpen = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!children) return null;

  return (
    <div className={cn("border border-border/50 rounded-lg bg-muted/10 my-2 overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        <BrainCircuit size={14} className={cn("text-primary", isOpen && "animate-pulse")} />
        <span>Thinking Process</span>
        {elapsedTime && <span className="opacity-70">({elapsedTime})</span>}
        <div className="flex-1" />
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {isOpen && (
        <div className="px-3 py-3 border-t border-border/30 text-xs text-muted-foreground bg-muted/5 animate-in slide-in-from-top-1 duration-200">
          <Markdown content={children} variant="compact" />
        </div>
      )}
    </div>
  );
};
