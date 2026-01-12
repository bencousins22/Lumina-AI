
import React from 'react';
import { 
  MessageSquare, FolderGit2, Activity, CalendarClock, 
  Folder, Database, Settings, ExternalLink, Shield, 
  Cpu, Zap, ArrowRight, Github
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface HomeDashboardProps {
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  agentConfig: any;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  onNavigate, 
  onOpenSettings,
  agentConfig
}) => {
  const modules = [
    { 
      id: 'chat', 
      label: 'Agent Chat', 
      description: 'Interact with your AI workforce',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/50'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      description: 'Manage workspaces & contexts',
      icon: FolderGit2,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'hover:border-indigo-500/50'
    },
    { 
      id: 'dashboard', 
      label: 'Connectivity', 
      description: 'Node editor & RFC bridge',
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/50'
    },
    { 
      id: 'scheduler', 
      label: 'Tasks', 
      description: 'Cron jobs & automation',
      icon: CalendarClock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-500/50'
    },
    { 
      id: 'files', 
      label: 'Files', 
      description: 'Workspace file explorer',
      icon: Folder,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'hover:border-rose-500/50'
    },
    { 
      id: 'backups', 
      label: 'Backups', 
      description: 'Snapshots & restoration',
      icon: Database,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'hover:border-cyan-500/50'
    }
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-background/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10">
                    <Logo variant="icon" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Lumina Workspace</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
                Welcome back. Your autonomous agent system is operational and ready for tasks.
            </p>
        </div>
        <div className="flex items-center gap-2">
             <Button variant="outline" className="gap-2" onClick={() => window.open('https://github.com', '_blank')}>
                 <Github size={16} /> <span className="hidden sm:inline">Documentation</span>
             </Button>
             <Button onClick={onOpenSettings} className="gap-2 shadow-lg shadow-primary/20">
                 <Settings size={16} /> Configure System
             </Button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {modules.map((module) => (
            <Card 
                key={module.id}
                className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border border-border/50",
                    module.border
                )}
                onClick={() => onNavigate(module.id)}
            >
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", module.bg, module.color)}>
                            <module.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                            <ArrowRight size={20} className="text-muted-foreground" />
                        </div>
                    </div>
                    
                    <div className="mt-auto space-y-1">
                        <h3 className="font-semibold text-lg">{module.label}</h3>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                </div>
                {/* Hover Gradient */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none bg-current",
                    module.color
                )} />
            </Card>
        ))}
      </div>

      {/* System Status & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Cpu size={18} className="text-primary" />
                  Agent Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background border border-border/50 space-y-2">
                      <div className="text-xs text-muted-foreground">Active Chat Model</div>
                      <div className="font-mono text-sm font-medium truncate" title={agentConfig?.chat_model_name}>
                          {agentConfig?.chat_model_name || 'Not configured'}
                      </div>
                      {agentConfig?.chat_model_name && (
                        <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full" />
                        </div>
                      )}
                  </div>
                   <div className="p-4 rounded-xl bg-background border border-border/50 space-y-2">
                      <div className="text-xs text-muted-foreground">Memory System</div>
                      <div className="font-mono text-sm font-medium">
                          {agentConfig?.memory_recall_enabled ? 'Vector Store Active' : 'Ephemeral Mode'}
                      </div>
                      <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
                          <div className={`h-full bg-blue-500 ${agentConfig?.memory_recall_enabled ? 'w-full' : 'w-[30%]'}`} />
                      </div>
                  </div>
              </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-primary" /> 
                  Security Status
              </h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm p-3 bg-background/50 rounded-lg border border-border/50">
                      <span className="text-muted-foreground">Auth Provider</span>
                      <span className="font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Local/Token
                      </span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 bg-background/50 rounded-lg border border-border/50">
                      <span className="text-muted-foreground">Environment</span>
                      <span className="font-medium">Production</span>
                  </div>
                  <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={onOpenSettings}>
                          <Zap size={12} className="mr-2" /> Manage Access Keys
                      </Button>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};
