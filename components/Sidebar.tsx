
import React from 'react';
import { Settings, Folder, Activity, Database, Calendar, MessageSquare, FolderGit2, User, ChevronsUpDown, LogOut, Home, Brain, Server } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { NotificationCenter } from './agent/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  onOpenSettings
}) => {
  const navItems = [
      { id: 'home', icon: Home, label: 'Home' },
      { id: 'chat', icon: MessageSquare, label: 'Chat' },
      { id: 'projects', icon: FolderGit2, label: 'Projects' },
      { id: 'memory', icon: Brain, label: 'Memory' },
      { id: 'mcp', icon: Server, label: 'MCP Servers' },
      { id: 'dashboard', icon: Activity, label: 'Connectivity' },
      { id: 'scheduler', icon: Calendar, label: 'Tasks' },
      { id: 'files', icon: Folder, label: 'Files' },
      { id: 'backups', icon: Database, label: 'Backups' },
  ];

  return (
    <aside className="w-[72px] flex flex-col items-center py-4 bg-sidebar border-r border-sidebar-border shrink-0 z-40 transition-all duration-300">
      <div className="mb-6">
        <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl border border-white/10 shadow-sm cursor-pointer" onClick={() => onChangeView('home')}>
             <Logo variant="icon" className="w-6 h-6" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={cn(
                    "p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                    currentView === item.id 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100" 
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:scale-105"
                )}
            >
                <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
                {/* Tooltip */}
                <span className="absolute left-14 px-2 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-border shadow-lg translate-x-[-4px] group-hover:translate-x-0 duration-200">
                    {item.label}
                </span>
            </button>
        ))}
      </nav>

      <div className="mt-auto px-2 w-full flex flex-col gap-4">
         <div className="w-full h-px bg-border/50" />
         
         <NotificationCenter />

         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                        <User size={16} />
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 ml-2">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Admin User</p>
                        <p className="text-xs leading-none text-muted-foreground">admin@lumina.ai</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>System Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
    </aside>
  );
};
