
import React from 'react';
import { cn } from '../../lib/utils';
import { ListVideo } from 'lucide-react';

interface QueueItem {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface QueueProps {
  items: QueueItem[];
  className?: string;
}

export const Queue: React.FC<QueueProps> = ({ items, className }) => {
  return (
    <div className={cn("absolute bottom-20 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur border border-border rounded-lg shadow-xl p-3 w-64 z-50 animate-in slide-in-from-bottom-5", className)}>
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground">
        <ListVideo size={12} />
        Queue ({items.length})
      </div>
      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
                    item.status === 'processing' ? "bg-amber-500 animate-pulse" :
                    item.status === 'completed' ? "bg-green-500" :
                    item.status === 'failed' ? "bg-red-500" : "bg-muted-foreground/30"
                )} />
                <span className={cn("truncate", item.status === 'completed' && "line-through opacity-50")}>{item.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};
