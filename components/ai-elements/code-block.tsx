
import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', filename, className }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border border-border bg-[#0d0d0d] overflow-hidden my-4", className)}>
      <div className="flex items-center justify-between px-3 py-2 bg-muted/10 border-b border-white/5">
        <div className="flex items-center gap-2">
            <Terminal size={12} className="text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">{filename || language}</span>
        </div>
        <button 
            onClick={handleCopy}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
            {copied ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
            {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-sm font-mono text-gray-300 leading-relaxed">
            <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
