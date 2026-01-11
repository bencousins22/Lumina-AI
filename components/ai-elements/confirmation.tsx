
import React from 'react';
import { cn } from '../../lib/utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface ConfirmationProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ title, description, onConfirm, onCancel, className }) => {
  return (
    <div className={cn("p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl my-4", className)}>
      <div className="flex gap-3">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg h-fit">
            <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{description}</p>
            <div className="flex gap-2">
                <Button size="sm" onClick={onConfirm} className="bg-amber-600 hover:bg-amber-700 text-white">Approve</Button>
                <Button size="sm" variant="ghost" onClick={onCancel}>Deny</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
