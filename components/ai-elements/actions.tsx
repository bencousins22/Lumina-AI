
import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ActionProps {
  content: string;
  onRegenerate?: () => void;
  onFeedback?: (type: 'up' | 'down') => void;
  className?: string;
}

export const Actions: React.FC<ActionProps> = ({ 
  content, 
  onRegenerate, 
  onFeedback, 
  className 
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-center gap-1 mt-2", className)}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
      >
        {copied ? <span className="text-green-500">Copied</span> : <><Copy size={12} className="mr-1.5" /> Copy</>}
      </Button>
      
      {onRegenerate && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onRegenerate}
        >
          <RefreshCw size={12} className="mr-1.5" /> Regenerate
        </Button>
      )}

      {onFeedback && (
        <>
            <div className="w-px h-3 bg-border mx-1" />
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => onFeedback('up')}>
                <ThumbsUp size={12} />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => onFeedback('down')}>
                <ThumbsDown size={12} />
            </Button>
        </>
      )}
    </div>
  );
};
