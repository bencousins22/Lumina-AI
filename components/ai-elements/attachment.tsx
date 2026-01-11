
import React from 'react';
import { FileText, X, Image as ImageIcon, Code } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AttachmentProps {
  name: string;
  type?: string;
  size?: string;
  onRemove?: () => void;
  className?: string;
}

export const Attachment: React.FC<AttachmentProps> = ({
  name,
  type,
  size,
  onRemove,
  className
}) => {
  const getIcon = () => {
    if (type?.startsWith('image')) return <ImageIcon size={16} />;
    if (type?.includes('code') || type?.includes('json') || type?.includes('javascript')) return <Code size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className={cn(
      "relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-sm max-w-[200px]",
      className
    )}>
      <div className="text-muted-foreground shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className="truncate font-medium text-xs text-foreground">{name}</span>
        {size && <span className="text-[10px] text-muted-foreground">{size}</span>}
      </div>

      {onRemove && (
        <button 
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
        >
            <X size={10} />
        </button>
      )}
    </div>
  );
};
