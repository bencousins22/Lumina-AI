
import React from 'react';
import { NodeToolbar, NodeToolbarProps } from '@xyflow/react';
import { cn } from '../../lib/utils';

export const Toolbar = React.forwardRef<HTMLDivElement, NodeToolbarProps & React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <NodeToolbar 
    className={cn("flex gap-1 items-center p-1 bg-card border border-border rounded-lg shadow-md", className)} 
    {...props}
  >
    {children}
  </NodeToolbar>
));
Toolbar.displayName = "Toolbar";
