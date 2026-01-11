import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { Check, Copy } from 'lucide-react';

interface MarkdownProps {
  content: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className, variant = 'default' }) => {
  return (
    <ReactMarkdown
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none break-words",
        variant === 'compact' ? "prose-sm leading-snug" : "leading-7 tracking-normal",
        className
      )}
      components={{
        pre: ({ node, ...props }) => (
          <div className="relative my-4 overflow-hidden rounded-lg border border-border/50 bg-[#0f0f11] shadow-inner">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
             </div>
             <pre {...props} className="p-4 overflow-x-auto text-sm font-mono text-gray-200 bg-transparent m-0 custom-scrollbar" />
          </div>
        ),
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          return isInline ? (
            <code 
              {...props} 
              className="px-1.5 py-0.5 rounded-[4px] bg-muted/60 text-foreground font-mono text-[0.9em] border border-border/40"
            >
              {children}
            </code>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
        // Styling for other elements
        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
        a: ({node, ...props}) => <a className="text-primary font-medium hover:underline underline-offset-4 decoration-primary/30 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-muted-foreground" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-muted-foreground" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 tracking-tight text-foreground" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 tracking-tight text-foreground" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 tracking-tight text-foreground" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/20 pl-4 italic my-4 text-muted-foreground bg-muted/10 py-2 pr-2 rounded-r" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );
};