import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: 'user' | 'model' | 'system';
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(({ className, from, children, ...props }, ref) => {
  const isUser = from === 'user';
  return (
    <div ref={ref} className={cn("flex w-full gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500", isUser ? "flex-row-reverse" : "flex-row", className)} {...props}>
        <div className={cn(
          "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl shadow-sm transition-transform hover:scale-105",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border text-foreground"
        )}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        <div className={cn("flex flex-col gap-1 max-w-[85%] lg:max-w-[75%] min-w-0", isUser ? "items-end" : "items-start")}>
            {children}
        </div>
    </div>
  );
});
Message.displayName = "Message";

export const MessageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { isUser?: boolean }>(({ className, isUser, children, ...props }, ref) => (
  <div ref={ref} className={cn(
      "rounded-2xl px-5 py-4 shadow-sm text-[15px] leading-relaxed overflow-hidden",
      isUser 
        ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/10" 
        : "bg-card border border-border/50 text-card-foreground rounded-tl-sm shadow-sm",
      className
  )} {...props}>
    {children}
  </div>
));
MessageContent.displayName = "MessageContent";

export const MessageResponse = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("prose prose-zinc dark:prose-invert max-w-none break-words", className)} {...props}>
    {children}
  </div>
));
MessageResponse.displayName = "MessageResponse";