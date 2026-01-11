
import React from 'react';
import { cn } from '../../lib/utils';
import { GitBranch, ChevronRight } from 'lucide-react';

interface BranchProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export const Branch: React.FC<BranchProps> = ({ children, active, onClick, className, label }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative pl-6 py-2 border-l-2 transition-all cursor-pointer group",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className
      )}
    >
      <div className={cn(
        "absolute left-[-5px] top-3 w-2.5 h-2.5 rounded-full border-2 bg-background z-10",
        active ? "border-primary" : "border-muted-foreground group-hover:border-primary/50"
      )} />
      
      {label && (
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-mono uppercase tracking-wider">
           <GitBranch size={12} />
           {label}
        </div>
      )}
      
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
};
