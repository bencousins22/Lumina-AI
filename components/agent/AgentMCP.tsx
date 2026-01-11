
import React, { useState, useEffect } from 'react';
import { Server, Activity, Power, Settings2, Plus, RefreshCw, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { agentService, MCPServer } from '../../services/agentService';
import { cn } from '../../lib/utils';

export const AgentMCP: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [configJson, setConfigJson] = useState('');

  const loadServers = async () => {
    setLoading(true);
    try {
      const data = await agentService.getMCPServers();
      setServers(data || []);
      
      // Load actual settings to get MCP config
      const settings = await agentService.getSettings();
      if (settings && settings.mcp_servers) {
          setConfigJson(JSON.stringify({ mcpServers: settings.mcp_servers }, null, 4));
      } else {
          setConfigJson(JSON.stringify({ mcpServers: {} }, null, 4));
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadServers(); }, []);

  const handleSaveConfig = async () => {
      try {
          const config = JSON.parse(configJson);
          await agentService.applyMCPServers(config);
          setConfigOpen(false);
          loadServers();
      } catch (e) {
          console.error("Failed to save MCP config:", e);
          alert("Invalid JSON or failed to apply configuration");
      }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-start shrink-0">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">MCP Servers</h2>
            <p className="text-muted-foreground">Manage Model Context Protocol connections.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={loadServers} disabled={loading}>
                <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} /> Refresh
            </Button>
            <Button onClick={() => setConfigOpen(true)}>
                <Settings2 size={16} className="mr-2" /> Configure
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.length === 0 && !loading && (
             <div className="col-span-full p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Server size={32} className="opacity-50" />
                 </div>
                 <h3 className="font-semibold text-lg">No MCP Servers Configured</h3>
                 <p className="text-sm mt-2 max-w-md mx-auto">
                    Add servers to the configuration file to enable external tools and capabilities for your agents.
                 </p>
                 <Button onClick={() => setConfigOpen(true)} className="mt-6">
                    <Plus size={16} className="mr-2" /> Add Server
                 </Button>
             </div>
        )}

        {servers.map((server, i) => (
            <Card key={i} className="overflow-hidden hover:border-primary/50 transition-all shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2.5 rounded-lg border", 
                                server.status === 'connected' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-destructive/10 border-destructive/20 text-destructive"
                            )}>
                                <Activity size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-base">{server.name}</CardTitle>
                                <CardDescription className="text-xs font-mono mt-1">stdio</CardDescription>
                            </div>
                        </div>
                        <Badge variant={server.status === 'connected' ? 'success' : 'destructive'}>
                            {server.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 min-h-[100px]">
                    <div className="text-xs text-muted-foreground space-y-2">
                        <div className="flex justify-between">
                            <span>Type</span>
                            <span className="font-medium text-foreground">stdio</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Uptime</span>
                            <span className="font-medium text-foreground">--</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Capabilities</span>
                            <span className="font-medium text-foreground">Tools, Resources</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-3 border-t bg-muted/10">
                    <div className="w-full flex gap-2">
                        <Button 
                            variant={server.status === 'connected' ? "destructive" : "default"} 
                            className="flex-1 h-8 text-xs"
                            size="sm"
                        >
                            <Power size={12} className="mr-2" />
                            {server.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Terminal size={14} />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>MCP Configuration</DialogTitle>
                <DialogDescription>
                    Edit the <code>mcp_config.json</code> file to register new servers.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 py-4 min-h-0">
                <Textarea 
                    className="h-full font-mono text-sm leading-relaxed bg-muted/30 resize-none"
                    value={configJson}
                    onChange={e => setConfigJson(e.target.value)}
                    spellCheck={false}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setConfigOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
