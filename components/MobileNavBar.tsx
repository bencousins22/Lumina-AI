
import React from 'react';
import { MessageSquare, Activity, Folder, Settings, CalendarClock, FolderGit2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavBarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onOpenSettings: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentView, onChangeView, onOpenSettings }) => {
  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'projects', icon: FolderGit2, label: 'Projects' },
    { id: 'dashboard', icon: Activity, label: 'Nodes' },
    { id: 'files', icon: Folder, label: 'Files' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around px-2 h-[60px]">
        {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full space-y-1 active:scale-95 transition-all duration-200",
                    currentView === item.id 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <div className={cn(
                    "p-1 rounded-full transition-colors",
                    currentView === item.id && "bg-primary/10"
                )}>
                    <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
        ))}

        <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center flex-1 h-full space-y-1 active:scale-95 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
            <div className="p-1">
                <Settings size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  );
};
