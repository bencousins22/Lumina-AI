import React from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Key, Lock, Shield } from 'lucide-react';

interface ExternalServicesProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
  additional?: any;
}

export const ExternalServices: React.FC<ExternalServicesProps> = ({ settings, updateSetting, additional }) => {
  // Use backend-provided providers or comprehensive fallback list
  const apiKeyProviders = additional?.chat_providers || [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'google', label: 'Google (Gemini)' },
    { value: 'groq', label: 'Groq' },
    { value: 'perplexity', label: 'Perplexity' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'mistral', label: 'Mistral AI' },
    { value: 'xai', label: 'xAI (Grok)' },
    { value: 'venice', label: 'Venice.ai' },
    { value: 'a0_venice', label: 'A0 Venice.ai' },
    { value: 'sambanova', label: 'Sambanova' },
    { value: 'github_copilot', label: 'GitHub Copilot' },
    { value: 'huggingface', label: 'HuggingFace' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'bedrock', label: 'AWS Bedrock' },
    { value: 'ollama', label: 'Ollama' },
    { value: 'lm_studio', label: 'LM Studio' },
    { value: 'cometapi', label: 'CometAPI' },
    { value: 'zai', label: 'Z.AI' },
    { value: 'zai_coding', label: 'Z.AI Coding' },
  ];

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Separate multiple API keys with commas for round-robin usage
          </p>
          {apiKeyProviders.map((provider: any) => (
            <div key={provider.value} className="space-y-2">
              <Label>{provider.label} API Key</Label>
              <Input
                type="password"
                value={settings?.api_keys?.[provider.value] || ''}
                onChange={(e) => updateSetting(`api_keys.${provider.value}`, e.target.value)}
                placeholder={`${provider.label} API key(s)`}
                autoComplete="off"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* LiteLLM */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">LiteLLM Global Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>LiteLLM Global Parameters</Label>
            <Textarea
              value={settings?.litellm_params || ''}
              onChange={(e) => updateSetting('litellm_params', e.target.value)}
              placeholder="KEY=VALUE format (like .env file)"
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              See <a href="https://docs.litellm.ai/" target="_blank" rel="noopener" className="text-primary hover:underline">LiteLLM docs</a>
            </p>
          </div>
        </div>
      </Card>

      {/* Secrets Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Secrets Management</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Variables Store</Label>
            <Textarea
              value={settings?.variables_store || ''}
              onChange={(e) => updateSetting('variables_store', e.target.value)}
              placeholder="KEY=VALUE format with # comments&#10;Not masked, visible to LLMs"
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Not masked from LLMs. Use for non-sensitive configuration.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Secrets Store</Label>
            <Textarea
              value={settings?.secrets_store || ''}
              onChange={(e) => updateSetting('secrets_store', e.target.value)}
              placeholder="KEY=VALUE format with # comments&#10;Masked from LLMs (values >= 4 chars)"
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Masked from LLMs. Values 4+ characters are replaced with *****.
            </p>
          </div>
        </div>
      </Card>

      {/* Authentication */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Authentication</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>UI Login</Label>
            <Input
              value={settings?.ui_login || ''}
              onChange={(e) => updateSetting('ui_login', e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <Label>UI Password</Label>
            <Input
              type="password"
              value={settings?.ui_password || ''}
              onChange={(e) => updateSetting('ui_password', e.target.value)}
              placeholder="Password"
              autoComplete="off"
            />
          </div>

          {additional?.is_dockerized && (
            <div className="space-y-2">
              <Label>Root Password (Docker)</Label>
              <Input
                type="password"
                value={settings?.root_password || ''}
                onChange={(e) => updateSetting('root_password', e.target.value)}
                placeholder="Root password for Docker container"
                autoComplete="off"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Update Checker */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Update Checker</h3>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Enable Update Checker</Label>
            <p className="text-sm text-muted-foreground">Check for new versions</p>
          </div>
          <Switch
            checked={settings?.update_checker_enabled || false}
            onCheckedChange={(checked) => updateSetting('update_checker_enabled', checked)}
          />
        </div>
      </Card>
    </div>
  );
};
