
import React from 'react';
import { cn } from '../../lib/utils';
import { Map } from 'lucide-react';

interface PlanProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Plan: React.FC<PlanProps> = ({ title = "Action Plan", children, className }) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card/30 overflow-hidden my-3", className)}>
        {title && (
            <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center gap-2">
                <Map size={14} className="text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
            </div>
        )}
        <div className="p-2 space-y-1">
            {children}
        </div>
    </div>
  );
};
