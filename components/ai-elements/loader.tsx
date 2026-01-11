
import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = "AI is working...", className }) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground p-2", className)}>
      <Loader2 size={16} className="animate-spin text-primary" />
      <span className="animate-pulse">{text}</span>
    </div>
  );
};
