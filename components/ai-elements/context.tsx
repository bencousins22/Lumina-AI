
import React from 'react';
import { cn } from '../../lib/utils';
import { Database, FileText, Link } from 'lucide-react';

interface ContextItem {
  id: string;
  type: 'file' | 'url' | 'database';
  title: string;
  description?: string;
}

interface ContextProps {
  items: ContextItem[];
  className?: string;
}

export const Context: React.FC<ContextProps> = ({ items, className }) => {
  if (!items.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 my-2", className)}>
      {items.map((item) => (
        <div 
            key={item.id} 
            className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 border border-border rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-default"
        >
            {item.type === 'file' && <FileText size={10} />}
            {item.type === 'url' && <Link size={10} />}
            {item.type === 'database' && <Database size={10} />}
            <span className="truncate max-w-[150px]">{item.title}</span>
        </div>
      ))}
    </div>
  );
};
