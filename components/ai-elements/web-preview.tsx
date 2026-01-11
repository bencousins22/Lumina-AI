
import React from 'react';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';

interface WebPreviewProps {
  url?: string;
  html?: string;
  className?: string;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ url, html, className }) => {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden bg-background my-4 shadow-sm", className)}>
      <div className="h-8 bg-muted/40 border-b border-border flex items-center px-3 gap-2">
        <Globe size={12} className="text-muted-foreground" />
        <div className="flex-1 h-5 bg-background border border-border/50 rounded flex items-center px-2 text-[10px] text-muted-foreground font-mono truncate">
            {url || 'local-preview'}
        </div>
        <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-border" />
            <div className="w-2 h-2 rounded-full bg-border" />
        </div>
      </div>
      <div className="aspect-video w-full bg-white relative">
        {html ? (
            <iframe 
                srcDoc={html} 
                className="w-full h-full border-none" 
                sandbox="allow-scripts"
                title="Preview"
            />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/10">
                Preview not available
            </div>
        )}
      </div>
    </div>
  );
};
