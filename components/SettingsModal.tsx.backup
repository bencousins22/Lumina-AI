
import React, { useState } from 'react';
import { X, Sliders, RefreshCw, Save, Cpu, Brain, Network, Shield, Mic, Terminal, Palette, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AgentConfig, DEFAULT_AGENT_CONFIG } from '../types';
import { cn } from '../lib/utils';
import { Separator } from './ui/separator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onSave: (config: AgentConfig) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const SECTIONS = [
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & display settings' },
    { id: 'models', label: 'AI Models', icon: Cpu, description: 'LLM providers & parameters' },
    { id: 'memory', label: 'Memory', icon: Brain, description: 'Recall & vector store' },
    { id: 'connectivity', label: 'Connectivity', icon: Network, description: 'RFC, Docker & MCP' },
    { id: 'system', label: 'System', icon: Terminal, description: 'Profile & environment' },
    { id: 'voice', label: 'Voice', icon: Mic, description: 'TTS & STT configuration' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Auth & encryption' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  theme,
  onToggleTheme
}) => {
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);
  const [activeSection, setActiveSection] = useState('appearance');
  const [mobileView, setMobileView] = useState<'menu' | 'detail'>('menu');

  React.useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setMobileView('menu');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleChange = (key: keyof AgentConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleMobileSectionClick = (id: string) => {
      setActiveSection(id);
      setMobileView('detail');
  };

  const SettingInput = ({ label, id, value, onChange, type = "text", placeholder }: any) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input 
        id={id} 
        type={type} 
        value={value} 
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)} 
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-8">
      <div 
        className="absolute inset-0 bg-background/80 md:bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full h-full md:max-w-5xl md:h-[85vh] bg-background md:bg-card md:border md:border-border md:rounded-xl md:shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sidebar */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border flex-col shrink-0 hidden md:flex">
             <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
                <div className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                    <Sliders size={18} className="text-primary" />
                    <span>Configuration</span>
                </div>
             </div>
             <nav className="p-3 space-y-1 overflow-y-auto flex-1">
                 {SECTIONS.map(section => (
                     <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeSection === section.id 
                                ? "bg-primary/10 text-primary shadow-sm" 
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                     >
                         <section.icon size={18} />
                         {section.label}
                     </button>
                 ))}
             </nav>
             <div className="p-4 border-t border-sidebar-border text-xs text-center text-muted-foreground bg-muted/10">
                 Agent Zero v{localConfig.version}
             </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/80 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button 
                        className={cn("md:hidden p-2 -ml-2 mr-1 rounded-full hover:bg-muted", mobileView === 'menu' && "hidden")}
                        onClick={() => setMobileView('menu')}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
                         {activeSection} Settings
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setLocalConfig(DEFAULT_AGENT_CONFIG)} className="hidden md:flex">
                        <RefreshCw size={14} className="mr-2" /> Reset
                    </Button>
                    <Button onClick={() => { onSave(localConfig); onClose(); }} size="sm">
                        <Save size={14} className="mr-2" /> Save
                    </Button>
                    <button onClick={onClose} className="p-2 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto workspace-scroll relative">
                
                {/* Mobile Menu */}
                <div className={cn("md:hidden p-4 space-y-2", mobileView === 'detail' && "hidden")}>
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => handleMobileSectionClick(section.id)}
                            className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-xl active:bg-muted transition-colors text-left group"
                        >
                            <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                <section.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-foreground">{section.label}</div>
                                <div className="text-xs text-muted-foreground">{section.description}</div>
                            </div>
                            <ChevronLeft size={16} className="rotate-180 text-muted-foreground" />
                        </button>
                    ))}
                </div>

                {/* Detail Form */}
                <div className={cn("p-4 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto", mobileView === 'menu' && "hidden md:block")}>
                    
                    {activeSection === 'appearance' && (
                         <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Interface</h3>
                                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
                                    <div className="space-y-1">
                                        <h4 className="font-medium">Theme Preference</h4>
                                        <p className="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                                        <Button 
                                            variant={theme === 'light' ? 'default' : 'ghost'} 
                                            size="sm" 
                                            onClick={() => theme !== 'light' && onToggleTheme?.()}
                                            className="h-8"
                                        >
                                            Light
                                        </Button>
                                        <Button 
                                            variant={theme === 'dark' ? 'default' : 'ghost'} 
                                            size="sm" 
                                            onClick={() => theme !== 'dark' && onToggleTheme?.()}
                                            className="h-8"
                                        >
                                            Dark
                                        </Button>
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}

                    {activeSection === 'models' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chat Model</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Provider</Label>
                                        <Select 
                                            value={localConfig.chat_model_provider} 
                                            onValueChange={(v) => handleChange('chat_model_provider', v)}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="openai">OpenAI</SelectItem>
                                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                                                <SelectItem value="openrouter">OpenRouter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <SettingInput id="chat_model" label="Model ID" value={localConfig.chat_model_name} onChange={(v: string) => handleChange('chat_model_name', v)} placeholder="e.g. gpt-4-turbo" />
                                    <SettingInput id="chat_base" label="API Endpoint" value={localConfig.chat_model_api_base} onChange={(v: string) => handleChange('chat_model_api_base', v)} placeholder="Optional" />
                                    <SettingInput id="chat_ctx" label="Context Window" type="number" value={localConfig.chat_model_ctx_length} onChange={(v: number) => handleChange('chat_model_ctx_length', v)} />
                                    
                                    <div className="flex items-center justify-between md:col-span-2 p-3 bg-muted/30 rounded-lg border border-border">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="vision" className="cursor-pointer">Vision Capabilities</Label>
                                            <p className="text-xs text-muted-foreground">Allow model to process images</p>
                                        </div>
                                        <Switch 
                                            id="vision"
                                            checked={localConfig.chat_model_vision} 
                                            onCheckedChange={checked => handleChange('chat_model_vision', checked)} 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Embedding Model</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingInput id="embed_provider" label="Provider" value={localConfig.embed_model_provider} onChange={(v: string) => handleChange('embed_model_provider', v)} />
                                    <SettingInput id="embed_name" label="Model ID" value={localConfig.embed_model_name} onChange={(v: string) => handleChange('embed_model_name', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'memory' && (
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Vector Memory</h4>
                                    <p className="text-sm text-muted-foreground">Enable long-term recall using embedding similarity.</p>
                                </div>
                                <Switch 
                                    checked={localConfig.memory_recall_enabled} 
                                    onCheckedChange={checked => handleChange('memory_recall_enabled', checked)} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border rounded-xl bg-card/30">
                                <SettingInput id="hist_len" label="Max History Tokens" type="number" value={localConfig.memory_recall_history_len} onChange={(v: number) => handleChange('memory_recall_history_len', v)} />
                                <SettingInput id="sim_thresh" label="Similarity Threshold (0-1)" type="number" value={localConfig.memory_recall_similarity_threshold} onChange={(v: number) => handleChange('memory_recall_similarity_threshold', v)} />
                                <SettingInput id="max_search" label="Max Results" type="number" value={localConfig.memory_recall_memories_max_search} onChange={(v: number) => handleChange('memory_recall_memories_max_search', v)} />
                            </div>
                         </div>
                    )}
                    
                    {activeSection === 'connectivity' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Remote Function Calls (RFC)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingInput id="rfc_url" label="RFC Host" value={localConfig.rfc_url} onChange={(v: string) => handleChange('rfc_url', v)} placeholder="localhost" />
                                    <SettingInput id="rfc_port" label="HTTP Port" type="number" value={localConfig.rfc_port_http} onChange={(v: number) => handleChange('rfc_port_http', v)} />
                                    <div className="flex items-center justify-between md:col-span-2 p-3 bg-muted/30 rounded-lg border border-border">
                                        <Label htmlFor="docker" className="cursor-pointer">Auto-Docker Management</Label>
                                        <Switch 
                                            id="docker"
                                            checked={localConfig.rfc_auto_docker} 
                                            onCheckedChange={checked => handleChange('rfc_auto_docker', checked)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'system' && (
                        <div className="space-y-6">
                            <SettingInput id="profile" label="Agent Profile Name" value={localConfig.agent_profile} onChange={(v: string) => handleChange('agent_profile', v)} />
                            <div className="space-y-2">
                                <Label>Environment Variables</Label>
                                <Textarea 
                                    value={localConfig.variables}
                                    onChange={e => handleChange('variables', e.target.value)}
                                    placeholder="API_KEY=123&#10;DEBUG=true"
                                    className="font-mono text-xs min-h-[150px] bg-muted/30"
                                />
                                <p className="text-[10px] text-muted-foreground">Define .env variables for your agent runtime (one per line).</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'voice' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SettingInput id="stt_lang" label="STT Language" value={localConfig.stt_language} onChange={(v: string) => handleChange('stt_language', v)} />
                            <SettingInput id="stt_model" label="Model Size" value={localConfig.stt_model_size} onChange={(v: string) => handleChange('stt_model_size', v)} />
                        </div>
                    )}

                    {activeSection === 'security' && (
                         <div className="space-y-6">
                            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
                                <h4 className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                                    <Shield size={16} /> Restricted Area
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingInput id="auth_login" label="Admin Login" value={localConfig.auth_login} onChange={(v: string) => handleChange('auth_login', v)} />
                                    <SettingInput id="auth_pass" label="Admin Password" type="password" value={localConfig.auth_password} onChange={(v: string) => handleChange('auth_password', v)} />
                                </div>
                            </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
