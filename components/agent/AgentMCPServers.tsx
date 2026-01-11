import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { agentService, MCPServer } from '../../services/agentService';
import {
  Server, Play, Square, RefreshCw, Plus, Settings, Terminal,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';

export const AgentMCPServers: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [serverLogs, setServerLogs] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServers();
    const interval = setInterval(loadServers, 5000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  const loadServers = async () => {
    try {
      const data = await agentService.getMCPServers();
      setServers(data);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServerLog = async (serverName: string) => {
    try {
      const result = await agentService.getMCPServerLog(serverName, 50);
      setServerLogs(prev => ({
        ...prev,
        [serverName]: result.log || []
      }));
    } catch (error) {
      console.error(`Failed to load logs for ${serverName}:`, error);
    }
  };

  const toggleServerExpansion = async (serverName: string) => {
    if (expandedServer === serverName) {
      setExpandedServer(null);
    } else {
      setExpandedServer(serverName);
      await loadServerLog(serverName);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'disconnected':
      default:
        return <AlertCircle size={16} className="text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'disconnected':
      default:
        return 'border-amber-500/20 bg-amber-500/5';
    }
  };

  const connectedCount = servers.filter(s => s.status === 'connected').length;
  const errorCount = servers.filter(s => s.status === 'error').length;
  const disconnectedCount = servers.filter(s => s.status === 'disconnected').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">MCP Servers</h2>
              <p className="text-sm text-muted-foreground">Model Context Protocol servers and tools</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadServers} variant="outline" size="sm">
              <RefreshCw size={14} className={cn("mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="default" size="sm">
              <Plus size={14} className="mr-2" />
              Add Server
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-500">{connectedCount}</div>
                  <div className="text-xs text-muted-foreground">Connected</div>
                </div>
                <CheckCircle size={24} className="text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-500">{disconnectedCount}</div>
                  <div className="text-xs text-muted-foreground">Disconnected</div>
                </div>
                <AlertCircle size={24} className="text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-500">{errorCount}</div>
                  <div className="text-xs text-muted-foreground">Error</div>
                </div>
                <XCircle size={24} className="text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Server List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && servers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-primary" />
          </div>
        ) : servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Server size={48} className="mb-4 opacity-50" />
            <p>No MCP servers configured</p>
            <Button className="mt-4" variant="outline">
              <Plus size={14} className="mr-2" />
              Add Your First Server
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {servers.map((server) => (
              <Card
                key={server.name}
                className={cn("border transition-all", getStatusColor(server.status))}
              >
                <CardContent className="p-4">
                  {/* Server Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleServerExpansion(server.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background/50 rounded-lg">
                        {getStatusIcon(server.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{server.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings size={14} />
                      </Button>
                      {expandedServer === server.name ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content - Logs */}
                  {expandedServer === server.name && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal size={14} />
                        <span className="text-xs font-medium">Server Logs</span>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                        {serverLogs[server.name]?.length > 0 ? (
                          <div className="font-mono text-xs space-y-1">
                            {serverLogs[server.name].map((log, idx) => (
                              <div key={idx} className="text-muted-foreground">{log}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No logs available</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
