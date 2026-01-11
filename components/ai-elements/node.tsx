
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';

interface NodeProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  handles?: {
    source?: boolean;
    target?: boolean;
  };
}

export const Node: React.FC<NodeProps> = ({ children, className, selected, handles }) => {
  return (
    <Card
      className={cn(
        "relative w-64 transition-all duration-200",
        selected ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10" : "hover:border-primary/50",
        className
      )}
    >
      {handles?.target && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !-translate-x-[50%] !border-2 !border-background !bg-muted-foreground transition-all hover:!bg-primary"
        />
      )}
      {children}
      {handles?.source && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !translate-x-[50%] !border-2 !border-background !bg-muted-foreground transition-all hover:!bg-primary"
        />
      )}
    </Card>
  );
};

export const NodeHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex flex-col gap-1 border-b border-border p-4 bg-muted/30 first:rounded-t-xl", className)}>
    {children}
  </div>
);

export const NodeTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn("font-semibold leading-none tracking-tight", className)}>{children}</h3>
);

export const NodeDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
);

export const NodeContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-4 text-sm", className)}>{children}</div>
);

export const NodeFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex items-center p-4 pt-0 text-xs text-muted-foreground border-t border-border mt-auto pt-3 pb-3", className)}>{children}</div>
);
