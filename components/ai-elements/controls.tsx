
import React from 'react';
import { Controls as ReactFlowControls, ControlProps } from '@xyflow/react';
import { cn } from '../../lib/utils';

export const Controls = React.forwardRef<HTMLDivElement, ControlProps & React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <ReactFlowControls 
    className={cn("!bg-card !border-border !fill-foreground !shadow-sm !rounded-lg overflow-hidden flex flex-col w-fit h-fit", className)} 
    {...props} 
  />
));
Controls.displayName = "Controls";
