import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fadeIn`}>
      <div className={`flex max-w-4xl w-full gap-4 md:gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          shrink-0 h-10 w-10 rounded-lg flex items-center justify-center shadow-md border border-border/50
          ${isUser ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}
        `}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-sm font-semibold text-foreground">
              {isUser ? 'You' : 'Lumina AI'}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`
            relative group rounded-2xl px-5 py-4 shadow-sm prose-content overflow-hidden
            ${isUser 
              ? 'bg-secondary text-secondary-foreground rounded-tr-sm' 
              : 'bg-card text-card-foreground border border-border rounded-tl-sm'}
          `}>
             {message.isThinking ? (
                <div className="flex items-center gap-2 text-muted-foreground h-6">
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             ) : (
               <ReactMarkdown 
                components={{
                    pre: ({node, ...props}) => (
                        <div className="relative my-4 rounded-lg overflow-hidden border border-border bg-[#0d0d0d]">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b border-border/50">
                                <span className="text-xs text-muted-foreground font-mono">Code</span>
                            </div>
                            <pre {...props} className="p-4 overflow-x-auto text-sm font-mono text-gray-200 bg-transparent m-0" />
                        </div>
                    ),
                    code: ({node, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !String(children).includes('\n');
                        return isInline ? (
                            <code {...props} className="px-1.5 py-0.5 rounded-md bg-muted/50 text-accent-foreground font-mono text-[0.9em]">
                                {children}
                            </code>
                        ) : (
                            <code {...props} className={className}>
                                {children}
                            </code>
                        )
                    }
                }}
               >
                {message.content}
               </ReactMarkdown>
             )}
            
            {/* Action Bar for AI messages */}
            {!isUser && !message.isThinking && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleCopy}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};