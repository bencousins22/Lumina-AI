import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ArrowUp, StopCircle, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onStop,
  loading,
  placeholder = "Message agent...",
  className,
  onFileSelect,
  disabled
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={cn("relative flex items-end gap-2 p-2 bg-background/50 backdrop-blur-xl border border-border rounded-[24px] focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm", className)}>
      {onFileSelect && (
        <>
          <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              className="hidden" 
              onChange={onFileSelect} 
          />
          <button 
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-all shrink-0 ml-1"
              disabled={loading || disabled}
              title="Attach files"
          >
              <Paperclip size={20} />
          </button>
        </>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[200px] py-3 text-[15px] placeholder:text-muted-foreground custom-scrollbar"
        disabled={loading || disabled}
      />

      {loading && onStop ? (
        <Button 
            variant="destructive" 
            size="icon" 
            className="h-10 w-10 rounded-full shrink-0 mr-1 shadow-none"
            onClick={onStop}
        >
            <StopCircle size={20} />
        </Button>
      ) : (
        <Button 
            variant="default" 
            size="icon" 
            className="h-10 w-10 rounded-full shrink-0 mr-1 shadow-md transition-transform hover:scale-105 active:scale-95"
            disabled={!value.trim() || disabled}
            onClick={onSubmit}
        >
            <ArrowUp size={20} />
        </Button>
      )}
    </div>
  );
};