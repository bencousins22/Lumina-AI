import React from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Server, Network } from 'lucide-react';

interface MCPSettingsProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

export const MCPSettings: React.FC<MCPSettingsProps> = ({ settings, updateSetting }) => {
  return (
    <div className="space-y-6">
      {/* External MCP Servers */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">External MCP Servers</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>MCP Client Init Timeout (seconds)</Label>
            <Input
              type="number"
              value={settings?.mcp_client_init_timeout || 60}
              onChange={(e) => updateSetting('mcp_client_init_timeout', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>MCP Client Tool Timeout (seconds)</Label>
            <Input
              type="number"
              value={settings?.mcp_client_tool_timeout || 300}
              onChange={(e) => updateSetting('mcp_client_tool_timeout', parseInt(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* A0 MCP Server */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">A0 MCP Server</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Enable A0 MCP Server</Label>
              <p className="text-sm text-muted-foreground">Model Context Protocol server for A0</p>
            </div>
            <Switch
              checked={settings?.mcp_server_enabled || false}
              onCheckedChange={(checked) => updateSetting('mcp_server_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>MCP Server Port</Label>
            <Input
              type="number"
              value={settings?.mcp_server_port || 3000}
              onChange={(e) => updateSetting('mcp_server_port', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>MCP Server Token</Label>
            <Input
              type="password"
              value={settings?.mcp_server_token || ''}
              onChange={(e) => updateSetting('mcp_server_token', e.target.value)}
              placeholder="Authentication token"
              autoComplete="off"
            />
          </div>
        </div>
      </Card>

      {/* A0 A2A Server */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">A0 A2A Server</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Enable A2A Server</Label>
              <p className="text-sm text-muted-foreground">Agent-to-Agent communication</p>
            </div>
            <Switch
              checked={settings?.a2a_server_enabled || false}
              onCheckedChange={(checked) => updateSetting('a2a_server_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>A2A Server Port</Label>
            <Input
              type="number"
              value={settings?.a2a_server_port || 50051}
              onChange={(e) => updateSetting('a2a_server_port', parseInt(e.target.value))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
