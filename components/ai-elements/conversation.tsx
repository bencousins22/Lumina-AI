
import React from 'react';
import { cn } from '../../lib/utils';

export const Conversation = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col h-full w-full bg-background overflow-hidden", className)} {...props}>
    {children}
  </div>
));
Conversation.displayName = "Conversation";

export const ConversationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth workspace-scroll", className)} {...props}>
    {children}
  </div>
));
ConversationContent.displayName = "ConversationContent";
