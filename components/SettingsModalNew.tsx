import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AgentSettings } from './settings/AgentSettings';
import { ExternalServices } from './settings/ExternalServices';
import { MCPSettings } from './settings/MCPSettings';
import { DeveloperSettings } from './settings/DeveloperSettings';
import { BackupSettings } from './settings/BackupSettings';
import { agentService } from '../services/agentService';
import { useToast } from '../hooks/use-toast';

interface SettingsModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModalNew: React.FC<SettingsModalNewProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<any>(null);
  const [additional, setAdditional] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await agentService.getSettings();
      setSettings(data.settings || data);
      setAdditional(data.additional || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load settings from backend',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => {
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      }
      // Handle nested keys like 'api_keys.openai'
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your agent and system preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSettings}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg">Loading settings...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="agent" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="agent">Agent</TabsTrigger>
                <TabsTrigger value="external">External</TabsTrigger>
                <TabsTrigger value="mcp">MCP/A2A</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
                <TabsTrigger value="backup">Backup</TabsTrigger>
              </TabsList>

              <TabsContent value="agent" className="mt-0">
                <AgentSettings settings={settings} updateSetting={updateSetting} additional={additional} />
              </TabsContent>

              <TabsContent value="external" className="mt-0">
                <ExternalServices settings={settings} updateSetting={updateSetting} additional={additional} />
              </TabsContent>

              <TabsContent value="mcp" className="mt-0">
                <MCPSettings settings={settings} updateSetting={updateSetting} />
              </TabsContent>

              <TabsContent value="developer" className="mt-0">
                <DeveloperSettings settings={settings} updateSetting={updateSetting} additional={additional} />
              </TabsContent>

              <TabsContent value="backup" className="mt-0">
                <BackupSettings settings={settings} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
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
