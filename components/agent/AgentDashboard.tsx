
import React, { useState } from 'react';
import { X, HardDrive, Archive, Calendar, Server, Activity, Settings } from 'lucide-react';
import { AgentFiles } from './AgentFiles';
import { AgentBackups } from './AgentBackups';
import { AgentScheduler } from './AgentScheduler';
import { AgentMCP } from './AgentMCP';

interface AgentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'files' | 'backups' | 'scheduler' | 'mcp' | 'settings'>('files');

  if (!isOpen) return null;

  const tabs = [
    { id: 'files', label: 'Files', icon: HardDrive },
    { id: 'backups', label: 'Backups', icon: Archive },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
    { id: 'mcp', label: 'MCP', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-background border border-border rounded-2xl shadow-2xl flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <div className="w-64 bg-sidebar border-r border-border flex flex-col shrink-0">
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                    <Activity size={24} />
                    <span>Agent Admin</span>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === tab.id 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'}
                        `}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground text-center">
                    Lumina A.I v{process.env.npm_package_version || '1.0.0'}
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-card/50">
            <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur">
                <h2 className="font-semibold text-lg capitalize">{activeTab}</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'files' && <AgentFiles />}
                {activeTab === 'backups' && <AgentBackups />}
                {activeTab === 'scheduler' && <AgentScheduler />}
                {activeTab === 'mcp' && <AgentMCP />}
                {activeTab === 'settings' && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Settings panel under construction
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
