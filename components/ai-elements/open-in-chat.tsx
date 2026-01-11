
import React from 'react';
import { cn } from '../../lib/utils';
import { MessageSquarePlus } from 'lucide-react';

interface OpenInChatProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const OpenInChat: React.FC<OpenInChatProps> = ({ label = "Discuss in Chat", onClick, className }) => {
  return (
    <button 
        onClick={onClick}
        className={cn("inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2", className)}
    >
        <MessageSquarePlus size={14} />
        {label}
    </button>
  );
};
