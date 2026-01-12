
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  type Connection as FlowConnection, 
  Background,
  BackgroundVariant,
  Position,
  type NodeMouseHandler,
  Handle,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import { Canvas } from '../ai-elements/canvas';
import { Edge } from '../ai-elements/edge';
import { Connection } from '../ai-elements/connection';
import { Controls } from '../ai-elements/controls';
import { Panel } from '../ai-elements/panel';
import { 
  Node as BaseNode, 
  NodeHeader, 
  NodeTitle, 
  NodeDescription, 
  NodeContent, 
  NodeFooter 
} from '../ai-elements/node';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import {
  Clock, MessageSquare, Server, Play, Save, Trash2,
  Plus, X, Calendar, Settings2, Zap, MoreHorizontal,
  Box, Terminal, Sparkles, Check, Layers, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { agentService } from '../../services/agentService';
import { useToast } from '../../hooks/use-toast';

// --- Visual Helpers ---

const getStatusBorder = (status?: string) => {
    switch (status) {
        case 'running': return 'ring-2 ring-primary border-primary shadow-[0_0_15px_rgba(37,99,235,0.3)]';
        case 'completed': return 'ring-2 ring-emerald-500 border-emerald-500';
        case 'error': return 'ring-2 ring-destructive border-destructive';
        default: return '';
    }
};

const StatusIcon = ({ status }: { status?: string }) => {
    if (status === 'running') return <Loader2 size={12} className="animate-spin text-primary" />;
    if (status === 'completed') return <Check size={12} className="text-emerald-500" />;
    if (status === 'error') return <X size={12} className="text-destructive" />;
    return null;
};

// --- Professional Node Components ---

const TriggerNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[260px] border-l-4 border-l-amber-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <NodeHeader className="bg-amber-500/10 pb-3 border-b border-amber-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-500">
          <div className="p-1.5 bg-amber-500/20 rounded-md shadow-sm text-amber-600 dark:text-amber-400">
             <Clock size={14} strokeWidth={2.5} />
          </div>
          <NodeTitle className="text-foreground">Scheduler</NodeTitle>
        </div>
        <div className="flex gap-2 items-center">
             <StatusIcon status={data.status} />
             {data.status === 'running' && <span className="text-[10px] text-primary font-medium animate-pulse">Running</span>}
             <div className={cn("h-1.5 w-1.5 rounded-full", data.status === 'idle' ? "bg-amber-500 animate-pulse" : "bg-muted")} />
        </div>
      </div>
      <NodeDescription className="text-muted-foreground/80">Automation Trigger</NodeDescription>
    </NodeHeader>
    <NodeContent className="space-y-3 pt-4">
       <div className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded border border-border/50">
          <span className="text-muted-foreground font-medium">Schedule</span>
          <code className="font-mono text-foreground">{data.cron || "* * * * *"}</code>
       </div>
       <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Calendar size={10} />
          <span>Next: {data.nextRun || "Calculating..."}</span>
       </div>
    </NodeContent>
    <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3 !border-4 !border-background shadow-sm" />
  </BaseNode>
);

const PromptNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[300px] border-l-4 border-l-blue-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3 !border-4 !border-background shadow-sm" />
    <NodeHeader className="bg-blue-500/10 pb-3 border-b border-blue-500/20">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-500">
              <div className="p-1.5 bg-blue-500/20 rounded-md shadow-sm text-blue-600 dark:text-blue-400">
                 <MessageSquare size={14} strokeWidth={2.5} />
              </div>
              <NodeTitle className="text-foreground">System Instruction</NodeTitle>
          </div>
          <StatusIcon status={data.status} />
      </div>
      <NodeDescription className="text-muted-foreground/80">Prompt Engineering</NodeDescription>
    </NodeHeader>
    <NodeContent className="pt-4">
      <div className="relative p-3 bg-muted/30 rounded-lg border border-border/50">
        <span className="absolute top-2 left-2 text-blue-500/20 text-4xl leading-none font-serif select-none">"</span>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed relative z-10 pl-2">
          {data.prompt || "Define the specific task or behavior instructions for the agent..."}
        </p>
      </div>
    </NodeContent>
    <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3 !border-4 !border-background shadow-sm" />
  </BaseNode>
);

const AgentNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[280px] border-l-4 border-l-emerald-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3 !border-4 !border-background shadow-sm" />
    <NodeHeader className="bg-emerald-500/10 pb-3 border-b border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-500">
            <div className="p-1.5 bg-emerald-500/20 rounded-md shadow-sm text-emerald-600 dark:text-emerald-400">
                {data.isZero ? <Layers size={14} strokeWidth={2.5} /> : <Server size={14} strokeWidth={2.5} />}
            </div>
            <NodeTitle className="text-foreground">{data.label}</NodeTitle>
        </div>
        <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shadow-sm flex items-center gap-1", 
            data.status === 'running' ? "bg-primary text-primary-foreground" :
            data.status === 'completed' ? "bg-emerald-500 text-white" :
            "bg-muted text-muted-foreground"
        )}>
            {data.status === 'running' && <Loader2 size={8} className="animate-spin" />}
            {data.status === 'running' ? 'Working' : (data.status || 'Idle')}
        </div>
      </div>
      <NodeDescription className="text-muted-foreground/80">{data.role || "General Purpose Worker"}</NodeDescription>
    </NodeHeader>
    <NodeContent className="space-y-3 pt-4">
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-background border border-border p-2 rounded flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                <Box size={12} className="text-muted-foreground group-hover:text-primary" />
                <span className="text-[10px] font-medium group-hover:text-foreground transition-colors">{data.toolsCount || 0} Tools</span>
            </div>
             <div className="bg-background border border-border p-2 rounded flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                <Terminal size={12} className="text-muted-foreground group-hover:text-primary" />
                <span className="text-[10px] font-medium group-hover:text-foreground transition-colors">Logs</span>
            </div>
        </div>
    </NodeContent>
    <NodeFooter className="justify-between border-t border-border/50 bg-muted/30">
        <span className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", 
                data.status === 'running' ? "bg-primary animate-ping" : 
                data.status === 'completed' ? "bg-emerald-500" : "bg-muted-foreground"
            )} />
            <span className="text-xs font-medium text-muted-foreground">{data.status === 'running' ? 'Processing...' : 'Online'}</span>
        </span>
        <button className="p-1.5 rounded-md hover:bg-background hover:text-foreground transition-colors text-muted-foreground hover:shadow-sm border border-transparent hover:border-border">
            <MoreHorizontal size={14} />
        </button>
    </NodeFooter>
    <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3 !border-4 !border-background shadow-sm" />
  </BaseNode>
);

// --- Sub-Components for Content Reuse ---

const NodeLibraryContent = ({ addNode }: { addNode: (type: string, data: any) => void }) => (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-1 pb-4">
        <button onClick={() => addNode('trigger', { cron: '0 0 * * *' })} className="flex flex-col md:flex-row items-center md:items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-amber-500/10 hover:border-amber-500/50 transition-all group text-center md:text-left shadow-sm">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm border border-amber-500/20">
            <Clock size={18} />
        </div>
        <div>
            <div className="font-semibold text-sm">Scheduler</div>
            <div className="text-[10px] text-muted-foreground">Time-based trigger</div>
        </div>
        </button>

        <button onClick={() => addNode('agent', { label: 'New Agent', role: 'Worker', status: 'active' })} className="flex flex-col md:flex-row items-center md:items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group text-center md:text-left shadow-sm">
        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm border border-emerald-500/20">
            <Server size={18} />
        </div>
        <div>
            <div className="font-semibold text-sm">Agent</div>
            <div className="text-[10px] text-muted-foreground">Task executor</div>
        </div>
        </button>

        <button onClick={() => addNode('prompt', { prompt: '' })} className="flex flex-col md:flex-row items-center md:items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group text-center md:text-left shadow-sm">
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm border border-blue-500/20">
            <MessageSquare size={18} />
        </div>
        <div>
            <div className="font-semibold text-sm">Instruction</div>
            <div className="text-[10px] text-muted-foreground">System prompt</div>
        </div>
        </button>
    </div>
);

const PropertyInspectorContent = ({ selectedNode, updateNodeData, deleteSelectedNode }: any) => {
    if (!selectedNode) return null;
    
    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                {selectedNode.type === 'trigger' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                                <Zap size={16} /> Automation Rule
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                This workflow starts automatically based on the schedule defined below.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Cron Schedule</Label>
                            <Input 
                                value={selectedNode.data.cron} 
                                onChange={e => updateNodeData('cron', e.target.value)}
                                placeholder="* * * * *"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Presets</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" size="sm" onClick={() => updateNodeData('cron', '0 9 * * *')} className="bg-background hover:bg-accent">Daily</Button>
                                <Button variant="outline" size="sm" onClick={() => updateNodeData('cron', '0 0 * * 0')} className="bg-background hover:bg-accent">Weekly</Button>
                                <Button variant="outline" size="sm" onClick={() => updateNodeData('cron', '*/30 * * * *')} className="bg-background hover:bg-accent">30m</Button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'prompt' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm">
                                <Sparkles size={16} /> Context Injection
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                The text below will be injected as a system instruction to the connected agent.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Instruction</Label>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Markdown Supported</span>
                            </div>
                            <Textarea 
                                className="min-h-[200px] font-mono text-sm leading-relaxed bg-background"
                                value={selectedNode.data.prompt}
                                onChange={e => updateNodeData('prompt', e.target.value)}
                                placeholder="Enter detailed instructions for the agent..."
                            />
                        </div>
                    </div>
                )}

                {selectedNode.type === 'agent' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Server size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold">{selectedNode.data.label}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={cn("w-2 h-2 rounded-full", selectedNode.data.status === 'running' ? "bg-primary animate-ping" : "bg-emerald-500")} />
                                    {selectedNode.data.status === 'running' ? 'Processing' : 'Active'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input 
                                value={selectedNode.data.label} 
                                onChange={e => updateNodeData('label', e.target.value)} 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Assigned Role</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Orchestrator', 'Researcher', 'Coder', 'Reviewer'].map(role => (
                                    <div 
                                        key={role}
                                        onClick={() => updateNodeData('role', role)}
                                        className={cn(
                                            "cursor-pointer px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center flex items-center justify-center gap-2",
                                            selectedNode.data.role === role 
                                                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                                : "bg-background border-border hover:bg-muted"
                                        )}
                                    >
                                        {selectedNode.data.role === role && <Check size={12} />}
                                        {role}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-3 pt-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Capabilities</h5>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Memory Access</span>
                                <input type="checkbox" checked className="accent-primary w-4 h-4 rounded" readOnly />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Web Browsing</span>
                                <input type="checkbox" checked className="accent-primary w-4 h-4 rounded" readOnly />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Code Execution</span>
                                <input type="checkbox" checked className="accent-primary w-4 h-4 rounded" readOnly />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-border bg-muted/10 shrink-0 mb-safe">
                <Button 
                    variant="destructive" 
                    className="w-full shadow-sm" 
                    onClick={deleteSelectedNode}
                >
                    <Trash2 size={16} className="mr-2" /> Remove Node
                </Button>
            </div>
        </div>
    );
};

// --- Main Editor Component ---

const NodeEditorContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNodes, getEdges } = useReactFlow();
  const { toast } = useToast();

  // UI State
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Derived
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
             const mobile = window.innerWidth < 1024;
             setIsMobile(mobile);
        }, 100);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
        window.removeEventListener('resize', checkMobile);
        clearTimeout(timeoutId);
    };
  }, []);

  const nodeTypes = useMemo(() => ({ 
    trigger: TriggerNode,
    prompt: PromptNode,
    agent: AgentNode
  }), []);

  const edgeTypes = useMemo(() => ({ 
    animated: Edge.Animated 
  }), []);

  // Load Workflow from LocalStorage or Backend
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        // Try to load saved workflow first
        const saved = await agentService.getWorkflow('default');
        if (saved && saved.nodes && saved.edges) {
          setNodes(saved.nodes);
          setEdges(saved.edges);
          return;
        }

        // Otherwise, generate from backend data
        const [tasks, subagents] = await Promise.all([
          agentService.getTasks(),
          agentService.listSubagents()
        ]);

        const newNodes: any[] = [];
        const newEdges: any[] = [];

        // Convert scheduler tasks to trigger nodes
        tasks.forEach((task: any, idx: number) => {
          newNodes.push({
            id: `trigger-${task.id}`,
            type: 'trigger',
            position: { x: 50, y: 150 + idx * 200 },
            data: {
              cron: task.cron,
              nextRun: task.next_run || 'Not scheduled',
              status: task.state?.toLowerCase() || 'idle'
            }
          });
        });

        // Convert subagents to agent nodes
        subagents.forEach((agent: any, idx: number) => {
          newNodes.push({
            id: `agent-${agent.name}`,
            type: 'agent',
            position: { x: 450, y: 150 + idx * 200 },
            data: {
              label: agent.name,
              role: agent.description || 'AI Agent',
              status: 'idle',
              toolsCount: agent.tools?.length || 0
            }
          });

          // Connect first task to each agent (simple default connection)
          if (tasks.length > 0 && idx === 0) {
            newEdges.push({
              id: `e-${tasks[0].id}-${agent.name}`,
              source: `trigger-${tasks[0].id}`,
              target: `agent-${agent.name}`,
              type: 'animated',
              animated: false,
              style: { stroke: 'var(--border)' },
              markerEnd: { type: MarkerType.ArrowClosed }
            });
          }
        });

        // If no backend data, show empty canvas
        if (newNodes.length === 0) {
          console.log('No workflow data available - empty canvas');
        }

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error('Failed to load workflow:', error);
        // Fall back to empty canvas on error
        setNodes([]);
        setEdges([]);
      }
    };

    loadWorkflow();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: FlowConnection) => setEdges((eds) => addEdge({ 
        ...params, 
        type: 'animated', 
        animated: false,
        style: { stroke: 'var(--border)' },
        markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
      setSelectedNodeId(node.id);
      if (isMobile) setLibraryOpen(false);
  }, [isMobile]);

  const onPaneClick = useCallback(() => {
      setSelectedNodeId(null);
  }, []);

  const addNode = (type: string, data: any) => {
      const id = `${type}-${Date.now()}`;
      const position = { 
          x: isMobile ? window.innerWidth/2 - 100 : 300 + (Math.random() * 50), 
          y: isMobile ? window.innerHeight/2 - 100 : 200 + (Math.random() * 50) 
      };
      
      const newNode = {
          id,
          type,
          position,
          data: { ...data, status: 'idle' }
      };
      
      setNodes((nds) => nds.concat(newNode));
      setLibraryOpen(false);
  };

  const updateNodeData = (key: string, value: any) => {
      if (!selectedNodeId) return;
      setNodes((nds) => nds.map((node) => {
          if (node.id === selectedNodeId) {
              return { ...node, data: { ...node.data, [key]: value } };
          }
          return node;
      }));
  };

  const deleteSelectedNode = () => {
      if (!selectedNodeId) return;
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setSelectedNodeId(null);
  };

  // --- Workflow Save/Load ---
  const handleSaveWorkflow = async () => {
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      await agentService.saveWorkflow('default', currentNodes, currentEdges);
      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save workflow. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleLoadWorkflow = async () => {
    try {
      const saved = await agentService.getWorkflow('default');
      if (saved && saved.nodes && saved.edges) {
        setNodes(saved.nodes);
        setEdges(saved.edges);
        toast({
          title: 'Workflow loaded',
          description: 'Your saved workflow has been restored.'
        });
      } else {
        toast({
          title: 'No saved workflow',
          description: 'No saved workflow found.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast({
        title: 'Load failed',
        description: 'Could not load workflow. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // --- Workflow Simulation ---
  const runSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // 1. Reset all nodes/edges to idle
    setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setEdges((eds) => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: 'var(--border)', strokeWidth: 1 } })));
    
    await new Promise(r => setTimeout(r, 600));

    // 2. Find triggers
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    const triggers = currentNodes.filter(n => n.type === 'trigger');
    
    if (triggers.length === 0) {
        alert("No Scheduler node found to start the workflow.");
        setIsRunning(false);
        return;
    }

    const processQueue = async (nodeId: string) => {
        // Update Node: Running
        setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n));
        
        // Simulate Processing Time (randomized slightly)
        const delay = 800 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, delay));
        
        // Update Node: Completed
        setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'completed' } } : n));
        
        // Find next paths
        const outgoingEdges = currentEdges.filter(e => e.source === nodeId);
        
        if (outgoingEdges.length > 0) {
            // Animate Edges sequentially
            for (const edge of outgoingEdges) {
                setEdges((eds) => eds.map(e => e.id === edge.id ? { 
                    ...e, 
                    animated: true, 
                    style: { ...e.style, stroke: 'var(--primary)', strokeWidth: 2 } 
                } : e));
                
                await new Promise(r => setTimeout(r, 400)); // Traverse time
                await processQueue(edge.target);
            }
        }
    };

    // Execute
    for (const trigger of triggers) {
        await processQueue(trigger.id);
    }
    
    setIsRunning(false);

  }, [getNodes, getEdges, setNodes, setEdges, isRunning]);

  return (
    <div className="w-full h-full relative bg-background animate-in fade-in duration-500 overflow-hidden">
       <Canvas
         nodes={nodes}
         edges={edges}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         onNodeClick={onNodeClick}
         onPaneClick={onPaneClick}
         nodeTypes={nodeTypes}
         edgeTypes={edgeTypes}
         connectionLineComponent={Connection}
         fitView
         minZoom={0.5}
       >
         <Background color="var(--border)" gap={24} size={1} variant={BackgroundVariant.Dots} />
         
         <Controls 
             className={cn(
                 "transition-all duration-300 shadow-lg border border-border bg-card", 
                 isMobile ? "!top-4 !left-4" : "!bottom-4 !left-4"
             )} 
             showInteractive={false}
         />
         
         {/* Top Actions Bar */}
         <Panel position="top-right" className="mr-4 mt-2 bg-transparent border-0 shadow-none p-0">
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant={isRunning ? "secondary" : "outline"}
                    className={cn("backdrop-blur shadow-sm transition-all border", isRunning && "border-primary text-primary")}
                    onClick={runSimulation}
                    disabled={isRunning}
                >
                    {isRunning ? <Loader2 size={14} className="animate-spin mr-2" /> : <Play size={14} className="text-green-500 fill-green-500 mr-2" />}
                    {isMobile ? "" : (isRunning ? "Running..." : "Run Flow")}
                </Button>
                <Button size="sm" variant="default" onClick={handleSaveWorkflow}>
                    <Save size={14} className="mr-2" />
                    {isMobile ? "" : "Save"}
                </Button>
            </div>
         </Panel>

         {/* Floating Action Button (Mobile) or Sidebar Toggle (Desktop) */}
         <div className={cn(
             "absolute z-30 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
             isMobile 
                ? "bottom-24 right-4" 
                : "top-4 left-4"
         )}>
             {isMobile ? (
                 <Button 
                    size="icon" 
                    className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
                    onClick={() => setLibraryOpen(true)}
                 >
                     <Plus size={24} />
                 </Button>
             ) : (
                 <Button 
                    size="icon" 
                    variant={libraryOpen ? "secondary" : "default"}
                    className="shadow-md h-10 w-10 border border-border"
                    onClick={() => setLibraryOpen(!libraryOpen)}
                 >
                     {libraryOpen ? <X size={20} /> : <Plus size={20} />}
                 </Button>
             )}
         </div>

         {/* MOBILE DRAWERS */}
         {isMobile && (
             <>
                <Drawer open={libraryOpen} onOpenChange={setLibraryOpen}>
                    <DrawerContent className="max-h-[60dvh] overflow-hidden flex flex-col">
                        <DrawerHeader>
                            <DrawerTitle className="text-center">Add Node</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 overflow-y-auto pb-12">
                            <NodeLibraryContent addNode={(t, d) => { addNode(t, d); setLibraryOpen(false); }} />
                        </div>
                    </DrawerContent>
                </Drawer>

                <Drawer open={!!selectedNodeId} onOpenChange={(open) => !open && setSelectedNodeId(null)}>
                    <DrawerContent className="h-[85vh] max-h-[85dvh] flex flex-col">
                        <DrawerHeader className="border-b border-border/50 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Settings2 size={18} />
                                </div>
                                <div>
                                    <DrawerTitle>Configuration</DrawerTitle>
                                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{selectedNode?.id}</div>
                                </div>
                            </div>
                        </DrawerHeader>
                        <div className="flex-1 overflow-y-auto pb-12">
                            <PropertyInspectorContent 
                                selectedNode={selectedNode} 
                                updateNodeData={updateNodeData} 
                                deleteSelectedNode={deleteSelectedNode} 
                            />
                        </div>
                    </DrawerContent>
                </Drawer>
             </>
         )}

         {/* DESKTOP CARDS */}
         {!isMobile && (
             <>
                {/* Node Library Overlay */}
                <Card className={cn(
                    "absolute z-20 shadow-2xl overflow-hidden transition-all duration-300 border border-border bg-card/95 backdrop-blur-xl top-16 left-4 w-72",
                    libraryOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
                )}>
                    <CardHeader className="pb-3 pt-4 px-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Add Node</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <NodeLibraryContent addNode={addNode} />
                    </CardContent>
                </Card>

                {/* Property Inspector */}
                <Card className={cn(
                    "absolute z-40 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col bg-card/95 backdrop-blur-xl border border-border shadow-2xl top-4 right-4 bottom-4 w-96 rounded-xl",
                    selectedNode ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"
                )}>
                    {selectedNode && (
                        <>
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Settings2 size={18} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold">Configuration</CardTitle>
                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{selectedNode.id}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedNodeId(null)} className="h-8 w-8 -mr-2">
                                    <X size={18} />
                                </Button>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto p-0">
                                <PropertyInspectorContent 
                                    selectedNode={selectedNode} 
                                    updateNodeData={updateNodeData} 
                                    deleteSelectedNode={deleteSelectedNode} 
                                />
                            </CardContent>
                        </>
                    )}
                </Card>
             </>
         )}

       </Canvas>
    </div>
  );
};

export const A2ANodeEditor: React.FC = () => {
    return (
        <ReactFlowProvider>
            <NodeEditorContent />
        </ReactFlowProvider>
    )
}
