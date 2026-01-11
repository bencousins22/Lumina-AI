
import React from 'react';
import { Panel as ReactFlowPanel, PanelProps } from '@xyflow/react';
import { cn } from '../../lib/utils';

export const Panel = React.forwardRef<HTMLDivElement, PanelProps & React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <ReactFlowPanel 
    className={cn("bg-card/80 backdrop-blur border border-border p-2 rounded-lg shadow-sm flex gap-2", className)} 
    {...props}
  >
    {children}
  </ReactFlowPanel>
));
Panel.displayName = "Panel";
