
import React from 'react';
import { cn } from '../../lib/utils';

interface InlineCitationProps {
  index: number;
  label?: string;
  className?: string;
}

export const InlineCitation: React.FC<InlineCitationProps> = ({ index, label, className }) => {
  return (
    <sup 
        className={cn(
            "inline-flex items-center justify-center h-4 min-w-[16px] px-0.5 rounded-full bg-muted text-[9px] font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5", 
            className
        )}
        title={label}
    >
        {index}
    </sup>
  );
};
