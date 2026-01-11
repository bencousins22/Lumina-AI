import React, { useCallback, useEffect, useState } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection as FlowConnection,
  Background,
  BackgroundVariant,
  Position,
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
} from '../ai-elements/node';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Clock, Server, Play, Save, Trash2, Plus, X, Settings2,
  Zap, Box, Terminal, Sparkles, Check, Layers, Loader2,
  Activity, Cpu, HardDrive, Network
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { agentService } from '../../services/agentService';

// Types
interface AgentNode {
  id: string;
  name: string;
  type: 'scheduler' | 'agent' | 'mcp' | 'orchestrator';
  status: 'idle' | 'running' | 'completed' | 'error';
  data: any;
}

interface DockerStats {
  cpu: number;
  memory: { used: number; total: number };
  network: { rx: number; tx: number };
}

// Utility functions
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

// Node Components
const SchedulerNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[260px] border-l-4 border-l-amber-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <NodeHeader className="bg-amber-500/10 pb-3 border-b border-amber-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-500">
          <div className="p-1.5 bg-amber-500/20 rounded-md">
            <Clock size={14} strokeWidth={2.5} />
          </div>
          <NodeTitle className="text-foreground">{data.name || 'Scheduler'}</NodeTitle>
        </div>
        <div className="flex gap-2 items-center">
          <StatusIcon status={data.status} />
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
    </NodeContent>
    <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3 !border-4 !border-background shadow-sm" />
  </BaseNode>
);

const AgentNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[280px] border-l-4 border-l-emerald-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3 !border-4 !border-background shadow-sm" />
    <NodeHeader className="bg-emerald-500/10 pb-3 border-b border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-500">
          <div className="p-1.5 bg-emerald-500/20 rounded-md">
            <Sparkles size={14} strokeWidth={2.5} />
          </div>
          <NodeTitle className="text-foreground">{data.name || 'Agent'}</NodeTitle>
        </div>
        <StatusIcon status={data.status} />
      </div>
      <NodeDescription className="text-muted-foreground/80 text-xs">{data.description || 'AI Agent'}</NodeDescription>
    </NodeHeader>
    <NodeContent className="space-y-2 pt-3">
      <div className="text-xs bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        {data.instruction || 'Ready to process'}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Box size={10} />
        <span>Tools: {data.tools || 12}</span>
        <span className="mx-1">•</span>
        <Terminal size={10} />
        <span>Logs: {data.logs || 0}</span>
      </div>
    </NodeContent>
    <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3 !border-4 !border-background shadow-sm" />
  </BaseNode>
);

const MCPNode = ({ data, selected }: any) => (
  <BaseNode selected={selected} className={cn("min-w-[240px] border-l-4 border-l-blue-500 shadow-sm transition-all duration-300 bg-card", getStatusBorder(data.status))}>
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3 !border-4 !border-background shadow-sm" />
    <NodeHeader className="bg-blue-500/10 pb-3 border-b border-blue-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-500">
          <div className="p-1.5 bg-blue-500/20 rounded-md">
            <Server size={14} strokeWidth={2.5} />
          </div>
          <NodeTitle className="text-foreground">{data.name || 'MCP Server'}</NodeTitle>
        </div>
        <div className={cn("h-2 w-2 rounded-full",
          data.status === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
        )} />
      </div>
      <NodeDescription className="text-muted-foreground/80 text-xs">External Service</NodeDescription>
    </NodeHeader>
    <NodeContent className="pt-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Network size={10} />
        <span>{data.status || 'disconnected'}</span>
      </div>
    </NodeContent>
  </BaseNode>
);

const nodeTypes = {
  scheduler: SchedulerNode,
  agent: AgentNode,
  mcp: MCPNode,
};

// Main Component
const A2AConnectivityInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [subagents, setSubagents] = useState<any[]>([]);
  const [mcpServers, setMCPServers] = useState<any[]>([]);
  const [schedulerTasks, setSchedulerTasks] = useState<any[]>([]);
  const [dockerStats, setDockerStats] = useState<DockerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fitView } = useReactFlow();

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      const [agentsData, mcpData, tasksData] = await Promise.all([
        agentService.listSubagents(),
        agentService.getMCPServers(),
        agentService.getTasks(),
      ]);

      setSubagents(agentsData);
      setMCPServers(mcpData);
      setSchedulerTasks(tasksData);

      // Build nodes and edges from real data
      const newNodes: any[] = [];
      const newEdges: any[] = [];

      // Add scheduler nodes
      tasksData.forEach((task: any, idx: number) => {
        newNodes.push({
          id: `scheduler-${task.id}`,
          type: 'scheduler',
          position: { x: 50, y: idx * 200 },
          data: { ...task, status: task.state || 'idle' },
        });
      });

      // Add agent nodes
      agentsData.forEach((agent: any, idx: number) => {
        newNodes.push({
          id: `agent-${agent.name}`,
          type: 'agent',
          position: { x: 400, y: idx * 200 },
          data: agent,
        });

        // Connect scheduler to agent if context matches
        tasksData.forEach((task: any) => {
          if (task.context_id) {
            newEdges.push({
              id: `e-${task.id}-${agent.name}`,
              source: `scheduler-${task.id}`,
              target: `agent-${agent.name}`,
              type: 'custom',
              markerEnd: { type: MarkerType.ArrowClosed },
            });
          }
        });
      });

      // Add MCP nodes
      mcpData.forEach((mcp: any, idx: number) => {
        newNodes.push({
          id: `mcp-${mcp.name}`,
          type: 'mcp',
          position: { x: 750, y: idx * 150 },
          data: mcp,
        });

        // Connect agents to MCPs
        agentsData.forEach((agent: any) => {
          newEdges.push({
            id: `e-${agent.name}-${mcp.name}`,
            source: `agent-${agent.name}`,
            target: `mcp-${mcp.name}`,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setTimeout(() => fitView({ duration: 300 }), 100);
    } catch (error) {
      console.error('Failed to load A2A data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges, fitView]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const onConnect = useCallback(
    (params: FlowConnection) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-background">
      <Canvas>
        <ReactFlowProvider>
          {/* React Flow Canvas would go here - simplified for now */}
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="opacity-30" />
        </ReactFlowProvider>
      </Canvas>

      {/* Docker Stats Panel */}
      <Panel position="top-left" className="m-4 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            Docker Runtime
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1">
                <Cpu size={10} />
                <span>CPU</span>
              </div>
              <div className="font-mono text-foreground">3.9%</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1">
                <HardDrive size={10} />
                <span>Memory</span>
              </div>
              <div className="font-mono text-foreground">1.1GB</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1">
                <Network size={10} />
                <span>Network</span>
              </div>
              <div className="font-mono text-foreground">30MB</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Summary Stats */}
      <Panel position="top-right" className="m-4 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            Hive Mind
          </h3>
          <div className="grid gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agents</span>
              <span className="font-mono text-foreground">{subagents.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MCP Servers</span>
              <span className="font-mono text-foreground">{mcpServers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasks</span>
              <span className="font-mono text-foreground">{schedulerTasks.length}</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Action Buttons */}
      <Panel position="bottom-right" className="m-4 bg-transparent border-0 shadow-none p-0">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadData}>
            <Play size={14} className="mr-2" />
            Refresh
          </Button>
          <Button size="sm" variant="default" onClick={() => console.log('Deploy Hive')}>
            <Zap size={14} className="mr-2" />
            Deploy
          </Button>
        </div>
      </Panel>

      <Controls />
    </div>
  );
};

export const A2AConnectivity = () => (
  <ReactFlowProvider>
    <A2AConnectivityInner />
  </ReactFlowProvider>
);
