
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { A2ANodeEditor } from './components/a2a/A2ANodeEditor';
import { AgentFiles } from './components/agent/AgentFiles';
import { AgentBackups } from './components/agent/AgentBackups';
import { AgentScheduler } from './components/agent/AgentScheduler';
import { AgentProjects } from './components/agent/AgentProjects';
import { MemoryDashboard } from './components/agent/MemoryDashboard';
import { AgentMCPServers } from './components/agent/AgentMCPServers';
import { HomeDashboard } from './components/HomeDashboard';
import { ArtifactPanel } from './components/ArtifactPanel';
import { MobileNavBar } from './components/MobileNavBar';
import { Login } from './components/Login';
import { CommandMenu } from './components/CommandMenu';
import { LuminaBanner } from './components/agent/LuminaBanner';
import { Toaster } from './components/ui/toaster';
import { Message, ChatSession, AgentConfig, DEFAULT_AGENT_CONFIG, AIConfig } from './types';
import { agentService } from './services/agentService';
import { v4 as uuidv4 } from 'uuid';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState('home'); // Default to home
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  // Layout State
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [activeArtifact, setActiveArtifact] = useState<{
    content: string;
    type: 'html' | 'code' | 'react';
    isOpen: boolean;
    title: string;
  } | null>(null);

  const [agentConfig, setAgentConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);

  useEffect(() => {
    const savedTheme = localStorage.getItem('lumina_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    }
  }, []);

  useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('lumina_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const checkMobile = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        // Don't auto-switch view on resize, let user stay where they are
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('lumina_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
      const loadConfig = async () => {
          // First try localStorage
          const savedConfig = localStorage.getItem('agent_zero_config');
          if (savedConfig) {
              try {
                  const parsed = JSON.parse(savedConfig);
                  setAgentConfig({ ...DEFAULT_AGENT_CONFIG, ...parsed });
                  if (parsed.api_keys?.default) {
                      agentService.setApiKey(parsed.api_keys.default);
                  }
              } catch(e) {
                  console.error("Failed to parse saved config", e);
              }
          }

          // Then try to load from backend (will overwrite localStorage if authenticated)
          if (isAuthenticated) {
              try {
                  const backendSettings = await agentService.getSettings();
                  if (backendSettings) {
                      setAgentConfig({ ...DEFAULT_AGENT_CONFIG, ...backendSettings });
                      localStorage.setItem('agent_zero_config', JSON.stringify(backendSettings));
                  }
              } catch (error) {
                  console.error('Failed to load settings from backend:', error);
              }
          }
      };
      loadConfig();
  }, [isAuthenticated]);

  // Centralized Navigation Handler
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setIsSettingsOpen(false); // Close settings on navigation
  };

  const saveConfig = async (newConfig: AgentConfig) => {
      setAgentConfig(newConfig);
      localStorage.setItem('agent_zero_config', JSON.stringify(newConfig));
      if (newConfig.api_keys?.default) {
          agentService.setApiKey(newConfig.api_keys.default);
      }
      // Save to backend
      try {
          await agentService.setSettings(newConfig);
      } catch (error) {
          console.error('Failed to save settings to backend:', error);
      }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: '',
      title: 'New Session',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const handleSendMessage = async (files: File[] = []) => {
    if ((!input.trim() && files.length === 0) || isStreaming) return;

    const contextId = currentSessionId || '';
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      attachments: files.map(f => f.name)
    };

    const tempAiMsg: Message = {
      id: uuidv4(),
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
      isThinking: true
    };

    const updatedSessions = sessions.map(s => 
      s.id === contextId || (contextId === '' && s === sessions[0])
        ? { ...s, messages: [...(s.messages || []), userMsg, tempAiMsg], updatedAt: Date.now() }
        : s
    );
    
    setSessions(updatedSessions);
    setInput('');
    setIsStreaming(true);

    try {
      const result = await agentService.sendMessage(contextId, userMsg.content, files);
      
      if (!contextId && result.context_id) {
          setCurrentSessionId(result.context_id);
      }

      const finalContextId = result.context_id || contextId;

      setSessions(prev => prev.map(s => {
        if (s.id === finalContextId || (contextId === '' && s === sessions[0])) {
          const newMsgs = [...s.messages];
          const lastIndex = newMsgs.length - 1;
          newMsgs[lastIndex] = {
               ...newMsgs[lastIndex],
               content: result.response,
               isThinking: false
          };
          return { ...s, id: finalContextId, messages: newMsgs };
        }
        return s;
      }));

    } catch (e: any) {
      console.error(e);
      setSessions(prev => prev.map(s => {
          if (s.id === (currentSessionId || '') || (currentSessionId === null && s === sessions[0])) {
             const newMsgs = [...s.messages];
             const lastIndex = newMsgs.length - 1;
             newMsgs[lastIndex] = {
                 ...newMsgs[lastIndex],
                 content: `**Error:** ${e.message || "Failed to communicate with agent."}`,
                 isThinking: false
             };
             return { ...s, messages: newMsgs };
          }
          return s;
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleResetChat = async () => {
    if (!currentSessionId) return;
    if (!confirm("Reset context? History will be cleared.")) return;
    try {
      await agentService.resetChat(currentSessionId);
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [] } : s));
    } catch (e) { console.error(e); alert("Failed to reset chat"); }
  };

  const handleTerminateChat = async () => {
    if (!currentSessionId) return;
    if (!confirm("Terminate chat?")) return;
    try {
      await agentService.terminateChat(currentSessionId);
      setSessions(prev => prev.filter(s => s.id !== currentSessionId));
      setCurrentSessionId(null);
      if (sessions.length <= 1) createNewSession();
    } catch (e) { console.error(e); alert("Failed to terminate chat"); }
  };

  const handleExportChat = async () => {
    if (!currentSessionId) return;
    try {
      const data = await agentService.exportChat(currentSessionId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${currentSessionId.substring(0,8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert("Failed to export chat"); }
  };

  const handlePauseChat = async () => {
    if (!currentSessionId) return;
    try {
        const result = await agentService.pause(currentSessionId, !isPaused);
        setIsPaused(result.pause);
    } catch (e) { console.error(e); }
  };

  const handleNudgeChat = async () => {
    if (!currentSessionId) return;
    try {
        await agentService.nudge(currentSessionId);
    } catch (e) { console.error(e); }
  };

  const handleRestartFramework = async () => {
    if (!confirm("Restart the entire Agent Zero framework? Current session state will be preserved but active processes will stop.")) return;
    try {
        await agentService.restart();
        alert("Framework restarting...");
        setTimeout(() => window.location.reload(), 2000);
    } catch (e) { console.error(e); }
  };

  const aiConfig: AIConfig = {
      model: agentConfig.chat_model_name,
      temperature: 0,
      topP: 0.95,
      topK: 64,
      thinkingBudget: 0
  };

  if (!isAuthenticated) {
      return (
        <>
            <Login onLogin={() => setIsAuthenticated(true)} />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                
                
                
                
            />
        </>
      );
  }

  const isChatView = currentView === 'chat';

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
      <LuminaBanner />
      <div className="flex flex-1 overflow-hidden">
        <CommandMenu 
          onNavigate={handleViewChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={() => setIsAuthenticated(false)}
        />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        
        
        
        
      />
      
      {!isMobile && (
        <Sidebar 
            currentView={currentView}
            onChangeView={handleViewChange}
            onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {isMobile ? (
        <div className="flex flex-col h-full w-full relative">
            <main 
                className="flex-1 h-full overflow-hidden relative pb-[calc(60px+env(safe-area-inset-bottom))]"
            >
                {currentView === 'home' && <HomeDashboard onNavigate={handleViewChange} onOpenSettings={() => setIsSettingsOpen(true)} agentConfig={agentConfig} />}
                {currentView === 'chat' && (
                    <ChatPanel 
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSendMessage={handleSendMessage}
                        isStreaming={isStreaming}
                        isPaused={isPaused}
                        aiConfig={aiConfig}
                        onResetChat={handleResetChat}
                        onTerminateChat={handleTerminateChat}
                        onExportChat={handleExportChat}
                        onPauseChat={handlePauseChat}
                        onNudgeChat={handleNudgeChat}
                        onRestartFramework={handleRestartFramework}
                        bottomPadding={true}
                        variant="full"
                    />
                )}
                {currentView === 'projects' && <div className="p-4 h-full overflow-y-auto"><AgentProjects currentContextId={currentSessionId || undefined} /></div>}
                {currentView === 'memory' && <div className="h-full overflow-hidden"><MemoryDashboard currentContextId={currentSessionId || undefined} /></div>}
                {currentView === 'mcp' && <div className="h-full overflow-hidden"><AgentMCPServers /></div>}
                {currentView === 'dashboard' && <div className="h-full w-full"><A2ANodeEditor /></div>}
                {currentView === 'scheduler' && <div className="p-4 h-full overflow-y-auto"><AgentScheduler /></div>}
                {currentView === 'files' && <div className="p-4 h-full overflow-y-auto"><AgentFiles currentContextId={currentSessionId || undefined} /></div>}
                {currentView === 'backups' && <div className="p-4 h-full overflow-y-auto"><AgentBackups /></div>}
            </main>
            
            <MobileNavBar 
                currentView={currentView}
                onChangeView={handleViewChange}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />
        </div>
      ) : (
        <>
            {/* Desktop Layout */}
            
            {/* Chat Panel - Only visible in Chat View or when toggled */}
            <div 
                className={cn(
                    "flex-shrink-0 bg-background border-r border-border transition-all duration-300 relative flex flex-col z-10",
                    isChatView ? "w-full" : (isChatPanelOpen ? "w-[400px]" : "w-0 overflow-hidden")
                )}
            >
                {/* Don't render ChatPanel content if width is 0 to save resources */}
                {(isChatView || isChatPanelOpen) && (
                     <ChatPanel 
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSendMessage={handleSendMessage}
                        isStreaming={isStreaming}
                        isPaused={isPaused}
                        aiConfig={aiConfig}
                        onResetChat={handleResetChat}
                        onTerminateChat={handleTerminateChat}
                        onExportChat={handleExportChat}
                        onPauseChat={handlePauseChat}
                        onNudgeChat={handleNudgeChat}
                        onRestartFramework={handleRestartFramework}
                        variant={isChatView ? 'full' : 'sidebar'}
                    />
                )}
                
                {/* Toggle Button - Visible when NOT in chat view */}
                {!isChatView && (
                    <button 
                        onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-6 w-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:scale-110 transition-transform"
                    >
                        {isChatPanelOpen ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
                    </button>
                )}
            </div>

            {/* Main Workspace Area - Hidden in pure Chat view */}
            {!isChatView && (
                <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-muted/30">
                    <div className="flex-1 overflow-hidden relative">
                        {currentView === 'home' && <HomeDashboard onNavigate={handleViewChange} onOpenSettings={() => setIsSettingsOpen(true)} agentConfig={agentConfig} />}
                        {currentView === 'dashboard' && <A2ANodeEditor />}
                        {currentView === 'projects' && (
                            <div className="p-6 h-full overflow-hidden"><AgentProjects currentContextId={currentSessionId || undefined} /></div>
                        )}
                        {currentView === 'memory' && (
                            <div className="h-full overflow-hidden"><MemoryDashboard currentContextId={currentSessionId || undefined} /></div>
                        )}
                        {currentView === 'mcp' && (
                            <div className="h-full overflow-hidden"><AgentMCPServers /></div>
                        )}
                        {currentView === 'files' && (
                            <div className="p-6 h-full overflow-hidden"><AgentFiles currentContextId={currentSessionId || undefined} /></div>
                        )}
                        {currentView === 'backups' && (
                            <div className="p-6 h-full overflow-hidden"><AgentBackups /></div>
                        )}
                        {currentView === 'scheduler' && (
                            <div className="p-6 h-full overflow-hidden"><AgentScheduler /></div>
                        )}
                    </div>

                    <ArtifactPanel 
                        isOpen={activeArtifact?.isOpen || false}
                        onClose={() => setActiveArtifact(prev => prev ? { ...prev, isOpen: false } : null)}
                        content={activeArtifact?.content || ''}
                        type={activeArtifact?.type || 'code'}
                        title={activeArtifact?.title}
                        isStreaming={isStreaming}
                    />
                </main>
            )}
        </>
      )}
      </div>
      <Toaster />
    </div>
  );
};

export default App;
