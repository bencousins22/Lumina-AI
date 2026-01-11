
import React from 'react';
import { cn } from '../../lib/utils';
import { FileCode, ExternalLink } from 'lucide-react';

interface ArtifactProps {
  title: string;
  type?: 'code' | 'web' | 'document';
  onOpen: () => void;
  className?: string;
}

export const Artifact: React.FC<ArtifactProps> = ({ title, type = 'code', onOpen, className }) => {
  return (
    <div className={cn("my-2", className)}>
        <button 
            onClick={onOpen}
            className="flex items-center gap-3 w-full max-w-sm p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left group"
        >
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <FileCode size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Generated Artifact</div>
                <div className="text-sm font-medium truncate">{title}</div>
            </div>
            <ExternalLink size={16} className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
    </div>
  );
};
