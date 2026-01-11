
import React from 'react';
import { cn } from '../../lib/utils';
import { Globe, ExternalLink } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  domain?: string;
}

interface SourcesProps {
  sources: Source[];
  className?: string;
}

export const Sources: React.FC<SourcesProps> = ({ sources, className }) => {
  if (!sources.length) return null;

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4", className)}>
      {sources.map((source, i) => (
        <a 
            key={i} 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group"
        >
            <div className="p-2 bg-muted/50 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Globe size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{source.title}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {source.domain || new URL(source.url).hostname}
                    <ExternalLink size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </a>
      ))}
    </div>
  );
};
