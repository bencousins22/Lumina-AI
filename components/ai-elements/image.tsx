
import React from 'react';
import { cn } from '../../lib/utils';
import { Download, Maximize2 } from 'lucide-react';

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({ src, alt, className }) => {
  return (
    <div className={cn("relative group rounded-xl overflow-hidden border border-border my-2 max-w-sm", className)}>
      <img src={src} alt={alt} className="w-full h-auto bg-muted/20" loading="lazy" />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button className="p-2 bg-background/90 rounded-lg hover:bg-background text-foreground shadow-sm transition-transform hover:scale-105">
            <Download size={16} />
        </button>
        <button className="p-2 bg-background/90 rounded-lg hover:bg-background text-foreground shadow-sm transition-transform hover:scale-105">
            <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
