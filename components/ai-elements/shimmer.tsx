
import React from 'react';
import { cn } from '../../lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className, width = "100%" }) => {
  return (
    <div 
        className={cn("h-4 rounded bg-muted/30 overflow-hidden relative", className)}
        style={{ width }}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        <style>{`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
  );
};
