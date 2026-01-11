
import React, { useRef, useEffect, useState } from 'react';
import { Command, MoreVertical, Trash2, RotateCcw, Download, Box, Sparkles, Terminal, Search, PenTool, BrainCircuit, ArrowRight, Pause, Play, Zap, Power } from 'lucide-react';
import { Button } from './ui/button';
import { Message as MessageType, AIConfig } from '../types';
import { 
    Conversation, 
    ConversationContent, 
    Message, 
    MessageContent, 
    MessageResponse, 
    ChatInput, 
    Attachment, 
    Actions
} from './ai-elements';
import { MessageRenderer } from './ai-elements/message-renderer';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

interface ChatPanelProps {
    messages: MessageType[];
    input: string;
    setInput: (val: string) => void;
    onSendMessage: (files: File[]) => void;
    isStreaming: boolean;
    isPaused?: boolean;
    aiConfig: AIConfig;
    onResetChat?: () => void;
    onTerminateChat?: () => void;
    onExportChat?: () => void;
    onPauseChat?: () => void;
    onNudgeChat?: () => void;
    onRestartFramework?: () => void;
    bottomPadding?: boolean;
    variant?: 'full' | 'sidebar';
}

const STARTER_PROMPTS = [
    { 
        icon: Terminal, 
        label: "Write Code", 
        description: "Generate a Python script to scrape web data",
        prompt: "Write a Python script to scrape data from a website using BeautifulSoup and requests, handling pagination and errors." 
    },
    { 
        icon: BrainCircuit, 
        label: "System Design", 
        description: "Architect a scalable microservices backend",
        prompt: "Help me design a scalable microservices architecture for a real-time chat application using Node.js, Redis, and MongoDB." 
    },
    { 
        icon: Search, 
        label: "Research", 
        description: "Find the latest trends in Agentic AI",
        prompt: "Research and summarize the latest trends and breakthroughs in Agentic AI frameworks for 2024-2025." 
    },
    { 
        icon: PenTool, 
        label: "Draft Content", 
        description: "Write a technical blog post about React",
        prompt: "Draft a comprehensive technical blog post explaining the benefits of React Server Components." 
    },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    input,
    setInput,
    onSendMessage,
    isStreaming,
    isPaused,
    aiConfig,
    onResetChat,
    onTerminateChat,
    onExportChat,
    onPauseChat,
    onNudgeChat,
    onRestartFramework,
    bottomPadding = false,
    variant = 'full'
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    
    const isSidebar = variant === 'sidebar';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming, files]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if ((!input.trim() && files.length === 0) || isStreaming) return;
        onSendMessage(files);
        setFiles([]);
    };

    const handleStarterClick = (prompt: string) => {
        setInput(prompt);
        // Optional: Auto-send or just fill input
        // onSendMessage([]); 
    };

    return (
        <div className="flex flex-col h-full bg-background relative font-sans w-full">
             {/* Unified Header */}
             <div className={cn(
                 "border-b border-border/40 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md z-10 sticky top-0 transition-all",
                 isSidebar ? "h-14 px-4" : "h-14 md:h-16 px-4 md:px-6"
             )}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={cn(
                        "rounded-lg flex items-center justify-center bg-primary/5 shrink-0 transition-all",
                        isSidebar ? "h-8 w-8 p-1" : "h-9 w-9 p-0.5"
                    )}>
                        <Logo variant="icon" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <h2 className={cn(
                            "font-semibold text-foreground tracking-tight flex items-center gap-2 truncate",
                            isSidebar ? "text-sm" : "text-sm"
                        )}>
                            {isSidebar ? "Copilot" : "Lumina Workspace"}
                            {!isSidebar && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium hidden sm:inline-block">Beta</span>}
                        </h2>
                        {!isSidebar ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>System Operational</span>
                            </div>
                        ) : (
                            <div className="text-[10px] text-muted-foreground truncate font-medium opacity-80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {aiConfig.model.split('/').pop()}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2 shrink-0">
                    {!isSidebar && (
                        <div className="hidden lg:flex items-center gap-2 mr-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onPauseChat}
                                className={cn("h-8 gap-2 border-border/50", isPaused && "bg-orange-500/10 border-orange-500/50 text-orange-500 hover:bg-orange-500/20")}
                            >
                                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                                <span className="hidden xl:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onNudgeChat}
                                className="h-8 gap-2 border-border/50"
                                title="Nudge agent to continue if stuck"
                            >
                                <Zap size={14} className="text-yellow-500" fill="currentColor" />
                                <span className="hidden xl:inline">Nudge</span>
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onRestartFramework}
                                className="h-8 gap-2 border-border/50 hover:text-destructive hover:border-destructive/50"
                                title="Restart Framework"
                            >
                                <Power size={14} />
                                <span className="hidden xl:inline">Restart</span>
                            </Button>

                            <div className="h-4 w-px bg-border/50 mx-1" />
                        </div>
                    )}

                    {!isSidebar && (
                        <div className="hidden md:flex items-center gap-2 mr-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 hover:bg-muted transition-colors cursor-pointer" title="Current Model">
                            <Box size={12} className="text-primary" />
                            {aiConfig.model.split('/').pop()}
                        </div>
                    )}
                    
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" onClick={onExportChat} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Export Chat">
                            <Download size={isSidebar ? 14 : 16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onResetChat} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Reset Context">
                            <RotateCcw size={isSidebar ? 14 : 16} />
                        </Button>
                        
                        {/* Mobile/Extra Menu Trigger */}
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile/Compact Menu Overlay */}
            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
                    <div className="absolute top-14 right-4 z-50 w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                        <div className="px-3 py-2 text-xs font-mono text-muted-foreground border-b border-border/50 mb-1">
                            Model: {aiConfig.model}
                        </div>
                        <button onClick={() => { onPauseChat?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted rounded-lg text-foreground transition-colors">
                            {isPaused ? <Play size={16} /> : <Pause size={16} />} {isPaused ? 'Resume Agent' : 'Pause Agent'}
                        </button>
                        <button onClick={() => { onNudgeChat?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted rounded-lg text-foreground transition-colors">
                            <Zap size={16} className="text-yellow-500" /> Nudge Agent
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button onClick={() => { onResetChat?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted rounded-lg text-foreground transition-colors">
                            <RotateCcw size={16} /> Reset Context
                        </button>
                        <button onClick={() => { onExportChat?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted rounded-lg text-foreground transition-colors">
                            <Download size={16} /> Export JSON
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button onClick={() => { onTerminateChat?.(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 size={16} /> Terminate
                        </button>
                    </div>
                </>
            )}

            {/* Messages Area */}
            <Conversation>
                <ConversationContent className={cn(
                    "w-full pt-4 scroll-smooth",
                    isSidebar ? "px-3" : "max-w-4xl mx-auto px-4 md:px-6",
                    bottomPadding && "pb-4"
                )}>
                    {messages.length === 0 ? (
                        <div className={cn(
                            "h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700",
                            isSidebar ? "p-2 min-h-[40vh]" : "p-4 min-h-[60vh]"
                        )}>
                             <div className={cn("mb-6 relative", isSidebar && "mb-4")}>
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                                <div className={cn("relative z-10 drop-shadow-2xl", isSidebar ? "w-12 h-12" : "w-20 h-20")}>
                                    <Logo variant="icon" />
                                </div>
                             </div>
                             
                             <h3 className={cn("font-bold text-foreground tracking-tight text-center", isSidebar ? "text-lg mb-2" : "text-2xl mb-3")}>
                                {isSidebar ? "Lumina Copilot" : "How can I help you today?"}
                             </h3>
                             
                             {!isSidebar && (
                                <p className="text-muted-foreground max-w-md text-center mb-10 text-sm leading-relaxed">
                                    I'm your advanced AI assistant. I can help you write code, analyze data, browse the web, and manage your projects.
                                </p>
                             )}

                             {isSidebar ? (
                                 <p className="text-xs text-muted-foreground text-center max-w-[250px]">
                                     Ask me anything about your current task or project.
                                 </p>
                             ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {STARTER_PROMPTS.map((starter, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleStarterClick(starter.prompt)}
                                            className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left group"
                                        >
                                            <div className="p-2.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary/10 transition-colors">
                                                <starter.icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-foreground mb-1 flex items-center justify-between">
                                                    {starter.label}
                                                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{starter.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                 </div>
                             )}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <Message key={msg.id} from={msg.role} className={cn(isSidebar && "gap-3")}>
                                <MessageContent 
                                    isUser={msg.role === 'user'} 
                                    className={cn(isSidebar && "py-3 px-3.5 text-sm")}
                                >
                                    <div className="flex items-center gap-2 mb-2 select-none">
                                        <span className={cn("text-xs font-semibold tracking-wide", msg.role === 'user' ? "text-primary-foreground/90" : "text-foreground/90")}>
                                            {msg.role === 'user' ? 'You' : 'Lumina'}
                                        </span>
                                    </div>
                                    
                                    {/* Attachments Display */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {msg.attachments.map((filename, i) => (
                                                <Attachment key={i} name={filename} className={msg.role === 'user' ? "bg-white/10 border-white/20 text-white" : ""} />
                                            ))}
                                        </div>
                                    )}

                                    <MessageResponse className={cn(isSidebar && "prose-sm")}>
                                        <MessageRenderer content={msg.content} />
                                    </MessageResponse>

                                    {!msg.isThinking && msg.role === 'model' && (
                                        <Actions content={msg.content} className={cn(isSidebar && "mt-1")} />
                                    )}
                                </MessageContent>
                            </Message>
                        ))
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </ConversationContent>

                {/* Input Area */}
                <div className={cn(
                    "bg-gradient-to-t from-background via-background to-transparent transition-all z-20",
                    isSidebar ? "px-3 pb-4 pt-2" : "px-4 md:px-6 pt-10 pb-6"
                )}>
                    <div className={cn(
                        "w-full relative",
                        !isSidebar && "max-w-4xl mx-auto"
                    )}>
                        {/* Active File Uploads Preview */}
                        {files.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-3 flex gap-2 overflow-x-auto px-1 py-1 w-full">
                                {files.map((file, i) => (
                                    <Attachment 
                                        key={i} 
                                        name={file.name} 
                                        size={(file.size / 1024).toFixed(0) + 'KB'}
                                        type={file.type}
                                        onRemove={() => removeFile(i)}
                                        className="shadow-lg bg-card animate-in zoom-in-95 fade-in slide-in-from-bottom-2"
                                    />
                                ))}
                            </div>
                        )}
                        
                        <ChatInput 
                            value={input}
                            onChange={setInput}
                            onSubmit={handleSend}
                            onStop={() => {}} 
                            loading={isStreaming}
                            onFileSelect={handleFileSelect}
                            disabled={isStreaming}
                            className={cn(
                                "shadow-2xl shadow-primary/5 border-border/80 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 bg-background/80 backdrop-blur-xl",
                                isSidebar && "rounded-[20px] py-1.5"
                            )}
                            placeholder={isSidebar ? "Ask Copilot..." : "Send a message..."}
                        />
                        {!isSidebar && (
                            <div className="text-[10px] text-center text-muted-foreground mt-2 opacity-50">
                                AI can make mistakes. Please verify important information.
                            </div>
                        )}
                    </div>
                </div>
            </Conversation>
        </div>
    );
};
