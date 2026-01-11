
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { agentService } from '../services/agentService';
import { useToast } from '../hooks/use-toast';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await agentService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await agentService.setSettings(settings);
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Loading settings...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your agent and system preferences
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="agent" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="external">External Services</TabsTrigger>
              <TabsTrigger value="mcp">MCP/A2A</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>

            {/* Agent Settings */}
            <TabsContent value="agent" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Chat Model</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input
                      value={settings?.chat_model_name || ''}
                      onChange={(e) => updateSetting('chat_model_name', e.target.value)}
                      placeholder="e.g., anthropic/claude-3-sonnet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={settings?.chat_api_key || ''}
                      onChange={(e) => updateSetting('chat_api_key', e.target.value)}
                      placeholder="Your API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={settings?.chat_model_max_tokens || 4096}
                      onChange={(e) => updateSetting('chat_model_max_tokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings?.chat_model_temperature || 0}
                      onChange={(e) => updateSetting('chat_model_temperature', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Utility Model</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input
                      value={settings?.util_model_name || ''}
                      onChange={(e) => updateSetting('util_model_name', e.target.value)}
                      placeholder="e.g., anthropic/claude-3-haiku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={settings?.util_api_key || ''}
                      onChange={(e) => updateSetting('util_api_key', e.target.value)}
                      placeholder="Your API key"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Memory Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Memory Recall</Label>
                      <p className="text-sm text-muted-foreground">
                        Store and retrieve conversation context
                      </p>
                    </div>
                    <Switch
                      checked={settings?.memory_recall_enabled || false}
                      onCheckedChange={(checked) => updateSetting('memory_recall_enabled', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Embedding Model</Label>
                    <Input
                      value={settings?.embed_model_name || ''}
                      onChange={(e) => updateSetting('embed_model_name', e.target.value)}
                      placeholder="e.g., text-embedding-3-small"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Embedding API Key</Label>
                    <Input
                      type="password"
                      value={settings?.embed_api_key || ''}
                      onChange={(e) => updateSetting('embed_api_key', e.target.value)}
                      placeholder="Your embedding API key"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* External Services */}
            <TabsContent value="external" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>OpenAI API Key</Label>
                    <Input
                      type="password"
                      value={settings?.openai_api_key || ''}
                      onChange={(e) => updateSetting('openai_api_key', e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Anthropic API Key</Label>
                    <Input
                      type="password"
                      value={settings?.anthropic_api_key || ''}
                      onChange={(e) => updateSetting('anthropic_api_key', e.target.value)}
                      placeholder="sk-ant-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google API Key</Label>
                    <Input
                      type="password"
                      value={settings?.google_api_key || ''}
                      onChange={(e) => updateSetting('google_api_key', e.target.value)}
                      placeholder="Your Google API key"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">LiteLLM Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable LiteLLM</Label>
                      <p className="text-sm text-muted-foreground">
                        Use LiteLLM proxy for model routing
                      </p>
                    </div>
                    <Switch
                      checked={settings?.litellm_enabled || false}
                      onCheckedChange={(checked) => updateSetting('litellm_enabled', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LiteLLM Base URL</Label>
                    <Input
                      value={settings?.litellm_base_url || ''}
                      onChange={(e) => updateSetting('litellm_base_url', e.target.value)}
                      placeholder="http://localhost:4000"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* MCP/A2A Settings */}
            <TabsContent value="mcp" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">MCP Server</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable MCP Server</Label>
                      <p className="text-sm text-muted-foreground">
                        Model Context Protocol server
                      </p>
                    </div>
                    <Switch
                      checked={settings?.mcp_server_enabled || false}
                      onCheckedChange={(checked) => updateSetting('mcp_server_enabled', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server Port</Label>
                    <Input
                      type="number"
                      value={settings?.mcp_server_port || 3000}
                      onChange={(e) => updateSetting('mcp_server_port', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server Token</Label>
                    <Input
                      type="password"
                      value={settings?.mcp_server_token || ''}
                      onChange={(e) => updateSetting('mcp_server_token', e.target.value)}
                      placeholder="Authentication token"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">A2A Server</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable A2A Server</Label>
                      <p className="text-sm text-muted-foreground">
                        Agent-to-Agent communication
                      </p>
                    </div>
                    <Switch
                      checked={settings?.a2a_server_enabled || false}
                      onCheckedChange={(checked) => updateSetting('a2a_server_enabled', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server Port</Label>
                    <Input
                      type="number"
                      value={settings?.a2a_server_port || 50051}
                      onChange={(e) => updateSetting('a2a_server_port', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Developer Settings */}
            <TabsContent value="developer" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Debug Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Show detailed logging and debug info
                      </p>
                    </div>
                    <Switch
                      checked={settings?.debug_mode || false}
                      onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit API request frequency
                      </p>
                    </div>
                    <Switch
                      checked={settings?.rate_limit_enabled || true}
                      onCheckedChange={(checked) => updateSetting('rate_limit_enabled', checked)}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Advanced</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom System Prompt</Label>
                    <Textarea
                      rows={6}
                      value={settings?.custom_system_prompt || ''}
                      onChange={(e) => updateSetting('custom_system_prompt', e.target.value)}
                      placeholder="Override the default system prompt..."
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Backup Settings */}
            <TabsContent value="backup" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Backup Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Auto-Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup agent state
                      </p>
                    </div>
                    <Switch
                      checked={settings?.auto_backup_enabled || false}
                      onCheckedChange={(checked) => updateSetting('auto_backup_enabled', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Interval (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings?.backup_interval_hours || 24}
                      onChange={(e) => updateSetting('backup_interval_hours', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Backups to Keep</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings?.max_backups || 10}
                      onChange={(e) => updateSetting('max_backups', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
