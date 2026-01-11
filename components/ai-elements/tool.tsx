
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Wrench, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface ToolProps {
  name: string;
  input?: string;
  output?: string;
  status?: 'calling' | 'success' | 'error';
  className?: string;
}

export const Tool: React.FC<ToolProps> = ({ name, input, output, status = 'success', className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("border border-border rounded-lg bg-card/50 overflow-hidden my-2", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={cn(
            "p-1.5 rounded-md", 
            status === 'calling' ? "bg-amber-500/10 text-amber-500 animate-pulse" :
            status === 'error' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}>
            <Wrench size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">{name}</div>
            <div className="text-[10px] text-muted-foreground truncate">
                {status === 'calling' ? 'Executing...' : 'Completed'}
            </div>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {isOpen && (
        <div className="px-3 py-2 border-t border-border/50 text-xs font-mono bg-muted/5 space-y-2">
           {input && (
             <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Input</div>
                <div className="bg-background border border-border rounded p-2 overflow-x-auto">{input}</div>
             </div>
           )}
           {output && (
             <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Output</div>
                <div className="bg-background border border-border rounded p-2 overflow-x-auto text-muted-foreground">{output}</div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
