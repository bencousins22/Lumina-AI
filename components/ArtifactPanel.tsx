
import React, { useState, useEffect } from 'react';
import { 
  Code, Eye, RefreshCw, Lock, 
  ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';
import { Button } from './ui/button';

interface ArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  type: 'html' | 'code' | 'react';
  title?: string;
  isStreaming?: boolean;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  isOpen,
  onClose,
  content,
  type,
  title = "Lumina Browser",
  isStreaming = false
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [iframeKey, setIframeKey] = useState(0);
  // Use configurable preview URL or default to localhost
  const [url, setUrl] = useState(
    typeof window !== 'undefined' && (window as any).PREVIEW_URL
      ? (window as any).PREVIEW_URL
      : 'localhost:3000/preview'
  );

  // Auto-switch to preview when content changes significantly or stops streaming
  useEffect(() => {
    if (type === 'html' && !isStreaming) {
      setActiveTab('preview');
    }
  }, [isStreaming, type]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className={`
      fixed inset-y-0 right-0 z-30
      w-full md:w-[50%] lg:w-[45%] xl:w-[40%]
      bg-background border-l border-border shadow-2xl
      flex flex-col
      transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* Browser Chrome Header */}
      <div className="h-14 bg-muted/40 border-b border-border flex items-center px-4 gap-4 shrink-0 select-none backdrop-blur-sm">
        {/* Window Controls (Traffic Lights) */}
        <div className="flex gap-2 group mr-1">
          <div 
            className="w-3 h-3 rounded-full bg-destructive/80 hover:bg-destructive border border-destructive/20 transition-all cursor-pointer shadow-sm" 
            onClick={onClose}
            title="Close Browser"
          />
          <div className="w-3 h-3 rounded-full bg-amber-400/80 hover:bg-amber-400 border border-amber-400/20 transition-all shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 border border-green-500/20 transition-all shadow-sm" />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <button className="p-1.5 rounded-md hover:bg-background/80 hover:text-foreground transition-colors disabled:opacity-30" disabled>
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-background/80 hover:text-foreground transition-colors disabled:opacity-30" disabled>
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-background/80 hover:text-foreground transition-colors" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 bg-background/50 border border-input/50 rounded-md h-8 flex items-center px-3 gap-2 text-xs text-muted-foreground shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background group">
          <Lock size={10} className="text-emerald-500 group-focus-within:text-emerald-600" />
          <span className="flex-1 truncate font-mono opacity-70 selection:bg-primary/20">{url}</span>
        </div>

        {/* View Toggles */}
        <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/50">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`
              p-1.5 rounded-md transition-all flex items-center justify-center
              ${activeTab === 'preview' 
                ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
            `}
            title="Preview"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`
              p-1.5 rounded-md transition-all flex items-center justify-center
              ${activeTab === 'code' 
                ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
            `}
            title="Code"
          >
            <Code size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-[#1e1e1e]">
        
        {/* Preview View */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {type === 'html' ? (
            <>
              <iframe
                key={iframeKey}
                srcDoc={content}
                title="Preview"
                className={`w-full h-full border-none bg-white transition-opacity duration-500 ${isStreaming ? 'opacity-0' : 'opacity-100'}`}
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
              />
              {/* Skeleton Loader Overlay */}
              {isStreaming && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20 flex flex-col animate-in fade-in duration-300">
                  
                  {/* Loading Indicator - Centered and prominent */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="flex flex-col items-center gap-4 p-6 bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10">
                          <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                              <Loader2 className="animate-spin text-primary relative z-10" size={32} />
                          </div>
                          <div className="text-center space-y-1">
                              <h3 className="text-sm font-semibold text-foreground">Building Application</h3>
                              <p className="text-xs text-muted-foreground">Generating structure and styles...</p>
                          </div>
                      </div>
                  </div>

                  {/* Page Structure Skeleton (Background) */}
                  <div className="w-full h-full flex flex-col opacity-50 overflow-hidden pointer-events-none">
                      {/* Navbar */}
                      <div className="h-14 border-b border-border/50 flex items-center px-6 gap-8 bg-muted/5">
                          <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" /> {/* Logo */}
                          <div className="flex gap-4">
                              <div className="w-20 h-4 rounded bg-muted/30 animate-pulse" />
                              <div className="w-20 h-4 rounded bg-muted/30 animate-pulse" />
                              <div className="w-20 h-4 rounded bg-muted/30 animate-pulse" />
                          </div>
                          <div className="flex-1" />
                          <div className="w-8 h-8 rounded-full bg-muted/30 animate-pulse" /> {/* Profile */}
                      </div>

                      <div className="flex-1 flex overflow-hidden">
                          {/* Sidebar */}
                          <div className="w-64 border-r border-border/50 p-6 space-y-6 hidden md:block bg-muted/5">
                              <div className="space-y-3">
                                  <div className="w-32 h-3 rounded bg-muted/40 animate-pulse" />
                                  <div className="w-full h-8 rounded-md bg-muted/20 animate-pulse" />
                                  <div className="w-full h-8 rounded-md bg-muted/20 animate-pulse" />
                                  <div className="w-full h-8 rounded-md bg-muted/20 animate-pulse" />
                              </div>
                              <div className="space-y-3 pt-4">
                                  <div className="w-24 h-3 rounded bg-muted/40 animate-pulse" />
                                  <div className="w-full h-24 rounded-lg bg-muted/20 animate-pulse" />
                              </div>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 p-8 space-y-8 overflow-hidden">
                              {/* Header/Hero Area */}
                              <div className="space-y-4 max-w-3xl">
                                  <div className="w-3/4 h-10 rounded-lg bg-muted/30 animate-pulse" /> {/* Title */}
                                  <div className="space-y-2">
                                      <div className="w-full h-4 rounded bg-muted/20 animate-pulse" />
                                      <div className="w-5/6 h-4 rounded bg-muted/20 animate-pulse" />
                                  </div>
                                  <div className="flex gap-3 pt-2">
                                      <div className="w-32 h-10 rounded-lg bg-muted/30 animate-pulse" />
                                      <div className="w-32 h-10 rounded-lg bg-muted/20 animate-pulse" />
                                  </div>
                              </div>

                              {/* Dashboard Grid / Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                  {[1, 2, 3].map((i) => (
                                      <div key={i} className="h-40 rounded-xl bg-muted/10 border border-border/50 p-4 space-y-4">
                                          <div className="flex justify-between items-start">
                                              <div className="w-10 h-10 rounded-lg bg-muted/30 animate-pulse" />
                                              <div className="w-4 h-4 rounded-full bg-muted/20 animate-pulse" />
                                          </div>
                                          <div className="space-y-2 pt-4">
                                              <div className="w-1/2 h-4 rounded bg-muted/30 animate-pulse" />
                                              <div className="w-3/4 h-3 rounded bg-muted/20 animate-pulse" />
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              {/* Table/List Section */}
                              <div className="rounded-xl border border-border/50 overflow-hidden">
                                   <div className="h-10 bg-muted/10 border-b border-border/50 flex items-center px-4 gap-4">
                                      <div className="w-4 h-4 rounded bg-muted/20" />
                                      <div className="w-32 h-3 rounded bg-muted/30" />
                                   </div>
                                   {[1, 2, 3].map(i => (
                                       <div key={i} className="h-12 border-b border-border/30 flex items-center px-4 gap-4 bg-background/50">
                                          <div className="w-4 h-4 rounded-sm bg-muted/20 animate-pulse" />
                                          <div className="flex-1 flex gap-8">
                                              <div className="w-1/4 h-3 rounded bg-muted/20 animate-pulse" />
                                              <div className="w-1/4 h-3 rounded bg-muted/20 animate-pulse" />
                                              <div className="w-1/4 h-3 rounded bg-muted/20 animate-pulse" />
                                          </div>
                                       </div>
                                   ))}
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-4 bg-muted/5">
               <div className="p-6 bg-background rounded-full shadow-sm ring-1 ring-border">
                 <Code size={48} className="opacity-20" />
               </div>
               <div className="text-center space-y-1">
                 <p className="font-medium text-foreground">No Preview Available</p>
                 <p className="text-sm">This content type cannot be rendered in the browser.</p>
               </div>
               <Button onClick={() => setActiveTab('code')} variant="outline" size="sm">View Source</Button>
            </div>
          )}
        </div>

        {/* Code View */}
        <div className={`absolute inset-0 overflow-auto bg-[#0d0d0d] text-[#e0e0e0] p-0 font-mono text-sm transition-opacity duration-300 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="sticky top-0 z-10 flex text-xs border-b border-[#333] bg-[#0d0d0d]">
             <div className="px-4 py-2 border-b-2 border-blue-500 text-blue-400">index.html</div>
          </div>
          <div className="p-4">
            <pre className="whitespace-pre-wrap break-all leading-relaxed">
                <code>{content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 border-t border-border bg-muted/40 flex items-center px-4 justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider backdrop-blur-sm">
        <div className="flex items-center gap-2">
           <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isStreaming ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'}`}></span>
           {isStreaming ? 'Compiling...' : 'Ready'}
        </div>
        <div className="flex items-center gap-4 opacity-70">
            <span>UTF-8</span>
            <span>{content.length} bytes</span>
        </div>
      </div>
    </div>
  );
};
