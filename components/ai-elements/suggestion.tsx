
import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

interface SuggestionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Suggestion: React.FC<SuggestionProps> = ({ children, onClick, className }) => {
  return (
    <button 
        onClick={onClick}
        className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/50 transition-all cursor-pointer whitespace-nowrap",
            className
        )}
    >
        <span className="opacity-50"><Sparkles size={10} /></span>
        {children}
    </button>
  );
};
