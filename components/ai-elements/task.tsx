
import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

interface TaskProps {
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  children: React.ReactNode;
  className?: string;
}

export const Task: React.FC<TaskProps> = ({ status, children, className }) => {
  return (
    <div className={cn("flex items-start gap-3 p-2 rounded-lg transition-colors", 
        status === 'completed' ? "bg-green-500/5" : "hover:bg-muted/30",
        className
    )}>
      <div className="mt-0.5 shrink-0">
         {status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
         {status === 'in-progress' && <Clock size={16} className="text-amber-500 animate-pulse" />}
         {status === 'failed' && <XCircle size={16} className="text-red-500" />}
         {status === 'pending' && <Circle size={16} className="text-muted-foreground/30" />}
      </div>
      <div className={cn("text-sm", status === 'completed' && "text-muted-foreground line-through decoration-muted-foreground/50")}>
        {children}
      </div>
    </div>
  );
};
