import React from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Brain, Cpu, Globe, MessageSquare, Mic } from 'lucide-react';

interface AgentSettingsProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
  additional?: any;
}

export const AgentSettings: React.FC<AgentSettingsProps> = ({ settings, updateSetting, additional }) => {
  return (
    <div className="space-y-6">
      {/* Agent Config */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Agent Configuration</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Default Agent Profile</Label>
            <Select value={settings?.agent_profile || ''} onValueChange={(val) => updateSetting('agent_profile', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent profile" />
              </SelectTrigger>
              <SelectContent>
                {additional?.agent_subdirs?.map((dir: string) => (
                  <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Subdirectory of /agents folder</p>
          </div>

          <div className="space-y-2">
            <Label>Knowledge Subdirectory</Label>
            <Select value={settings?.knowledge_subdir || ''} onValueChange={(val) => updateSetting('knowledge_subdir', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select knowledge directory" />
              </SelectTrigger>
              <SelectContent>
                {additional?.knowledge_subdirs?.map((dir: string) => (
                  <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Subdirectory of /knowledge folder</p>
          </div>
        </div>
      </Card>

      {/* Chat Model */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Chat Model</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chat Model Provider</Label>
            <Select value={settings?.chat_model_provider || ''} onValueChange={(val) => updateSetting('chat_model_provider', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {additional?.chat_providers?.map((p: any) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chat Model Name</Label>
            <Input
              value={settings?.chat_model_name || ''}
              onChange={(e) => updateSetting('chat_model_name', e.target.value)}
              placeholder="e.g., anthropic/claude-3-sonnet"
            />
          </div>

          <div className="space-y-2">
            <Label>Chat Model API Base URL</Label>
            <Input
              value={settings?.chat_model_api_base || ''}
              onChange={(e) => updateSetting('chat_model_api_base', e.target.value)}
              placeholder="Optional - for Azure/local/custom providers"
            />
          </div>

          <div className="space-y-2">
            <Label>Context Length (max tokens)</Label>
            <Input
              type="number"
              value={settings?.chat_model_context_length || 4096}
              onChange={(e) => updateSetting('chat_model_context_length', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Context Window Space for Chat History: {(settings?.chat_context_ratio || 0.5).toFixed(2)}</Label>
            <Slider
              value={[settings?.chat_context_ratio || 0.5]}
              onValueChange={(val) => updateSetting('chat_context_ratio', val[0])}
              min={0.01}
              max={1}
              step={0.01}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">Portion of context reserved for chat history</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Supports Vision</Label>
              <p className="text-sm text-muted-foreground">Model can process images</p>
            </div>
            <Switch
              checked={settings?.chat_model_supports_vision || false}
              onCheckedChange={(checked) => updateSetting('chat_model_supports_vision', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Requests/min Limit</Label>
              <Input
                type="number"
                value={settings?.chat_rpm_limit || 0}
                onChange={(e) => updateSetting('chat_rpm_limit', parseInt(e.target.value))}
                placeholder="0 = unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label>Input Tokens/min</Label>
              <Input
                type="number"
                value={settings?.chat_input_tpm_limit || 0}
                onChange={(e) => updateSetting('chat_input_tpm_limit', parseInt(e.target.value))}
                placeholder="0 = unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label>Output Tokens/min</Label>
              <Input
                type="number"
                value={settings?.chat_output_tpm_limit || 0}
                onChange={(e) => updateSetting('chat_output_tpm_limit', parseInt(e.target.value))}
                placeholder="0 = unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chat Model Additional Parameters</Label>
            <Textarea
              value={settings?.chat_model_params || ''}
              onChange={(e) => updateSetting('chat_model_params', e.target.value)}
              placeholder="KEY=VALUE format (like .env file)"
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              See <a href="https://docs.litellm.ai/docs/completion/input" target="_blank" rel="noopener" className="text-primary hover:underline">LiteLLM docs</a>
            </p>
          </div>
        </div>
      </Card>

      {/* Utility Model */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Utility Model</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Utility Model Provider</Label>
            <Select value={settings?.util_model_provider || ''} onValueChange={(val) => updateSetting('util_model_provider', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {additional?.chat_providers?.map((p: any) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Utility Model Name</Label>
            <Input
              value={settings?.util_model_name || ''}
              onChange={(e) => updateSetting('util_model_name', e.target.value)}
              placeholder="e.g., anthropic/claude-3-haiku"
            />
          </div>

          <div className="space-y-2">
            <Label>Utility Model API Base URL</Label>
            <Input
              value={settings?.util_model_api_base || ''}
              onChange={(e) => updateSetting('util_model_api_base', e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Requests/min Limit</Label>
              <Input
                type="number"
                value={settings?.util_rpm_limit || 0}
                onChange={(e) => updateSetting('util_rpm_limit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Input Tokens/min</Label>
              <Input
                type="number"
                value={settings?.util_input_tpm_limit || 0}
                onChange={(e) => updateSetting('util_input_tpm_limit', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Output Tokens/min</Label>
              <Input
                type="number"
                value={settings?.util_output_tpm_limit || 0}
                onChange={(e) => updateSetting('util_output_tpm_limit', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Utility Model Additional Parameters</Label>
            <Textarea
              value={settings?.util_model_params || ''}
              onChange={(e) => updateSetting('util_model_params', e.target.value)}
              placeholder="KEY=VALUE format"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Browser Model */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Web Browser Model</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Browser Model Provider</Label>
            <Select value={settings?.browser_model_provider || ''} onValueChange={(val) => updateSetting('browser_model_provider', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {additional?.chat_providers?.map((p: any) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Browser Model Name</Label>
            <Input
              value={settings?.browser_model_name || ''}
              onChange={(e) => updateSetting('browser_model_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Browser Model API Base URL</Label>
            <Input
              value={settings?.browser_model_api_base || ''}
              onChange={(e) => updateSetting('browser_model_api_base', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Supports Vision</Label>
              <p className="text-sm text-muted-foreground">Model can process images</p>
            </div>
            <Switch
              checked={settings?.browser_model_supports_vision || false}
              onCheckedChange={(checked) => updateSetting('browser_model_supports_vision', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Requests/min Limit</Label>
              <Input type="number" value={settings?.browser_rpm_limit || 0} onChange={(e) => updateSetting('browser_rpm_limit', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Input Tokens/min</Label>
              <Input type="number" value={settings?.browser_input_tpm_limit || 0} onChange={(e) => updateSetting('browser_input_tpm_limit', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Output Tokens/min</Label>
              <Input type="number" value={settings?.browser_output_tpm_limit || 0} onChange={(e) => updateSetting('browser_output_tpm_limit', parseInt(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Browser Model Additional Parameters</Label>
            <Textarea
              value={settings?.browser_model_params || ''}
              onChange={(e) => updateSetting('browser_model_params', e.target.value)}
              placeholder="KEY=VALUE format"
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Browser HTTP Headers</Label>
            <Textarea
              value={settings?.browser_http_headers || ''}
              onChange={(e) => updateSetting('browser_http_headers', e.target.value)}
              placeholder="KEY=VALUE format"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Embedding Model */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Embedding Model</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Embedding Model Provider</Label>
            <Select value={settings?.embed_model_provider || ''} onValueChange={(val) => updateSetting('embed_model_provider', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {additional?.embedding_providers?.map((p: any) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Embedding Model Name</Label>
            <Input
              value={settings?.embed_model_name || ''}
              onChange={(e) => updateSetting('embed_model_name', e.target.value)}
              placeholder="e.g., text-embedding-3-small"
            />
          </div>

          <div className="space-y-2">
            <Label>Embedding Model API Base URL</Label>
            <Input
              value={settings?.embed_model_api_base || ''}
              onChange={(e) => updateSetting('embed_model_api_base', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Requests/min Limit</Label>
              <Input type="number" value={settings?.embed_rpm_limit || 0} onChange={(e) => updateSetting('embed_rpm_limit', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Input Tokens/min</Label>
              <Input type="number" value={settings?.embed_input_tpm_limit || 0} onChange={(e) => updateSetting('embed_input_tpm_limit', parseInt(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Embedding Model Additional Parameters</Label>
            <Textarea
              value={settings?.embed_model_params || ''}
              onChange={(e) => updateSetting('embed_model_params', e.target.value)}
              placeholder="KEY=VALUE format"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Memory Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Memory Configuration</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Memory Subdirectory</Label>
            <Input
              value={settings?.memory_subdir || ''}
              onChange={(e) => updateSetting('memory_subdir', e.target.value)}
              placeholder="default"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Memory Auto-Recall Enabled</Label>
              <p className="text-sm text-muted-foreground">Automatically retrieve relevant memories</p>
            </div>
            <Switch
              checked={settings?.memory_auto_recall_enabled || false}
              onCheckedChange={(checked) => updateSetting('memory_auto_recall_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Memory Auto-Recall Delayed</Label>
              <p className="text-sm text-muted-foreground">Delay recall until needed</p>
            </div>
            <Switch
              checked={settings?.memory_auto_recall_delayed || false}
              onCheckedChange={(checked) => updateSetting('memory_auto_recall_delayed', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Auto-Recall AI Query Preparation</Label>
              <p className="text-sm text-muted-foreground">Use AI to prepare queries</p>
            </div>
            <Switch
              checked={settings?.memory_ai_query || false}
              onCheckedChange={(checked) => updateSetting('memory_ai_query', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Auto-Recall AI Post-Filtering</Label>
              <p className="text-sm text-muted-foreground">Use AI to filter results</p>
            </div>
            <Switch
              checked={settings?.memory_ai_filter || false}
              onCheckedChange={(checked) => updateSetting('memory_ai_filter', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Memory Auto-Recall Interval: {settings?.memory_recall_interval || 5}</Label>
            <Slider
              value={[settings?.memory_recall_interval || 5]}
              onValueChange={(val) => updateSetting('memory_recall_interval', val[0])}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">Messages between recalls</p>
          </div>

          <div className="space-y-2">
            <Label>Auto-Recall History Length</Label>
            <Input
              type="number"
              value={settings?.memory_history_length || 3}
              onChange={(e) => updateSetting('memory_history_length', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Similarity Threshold: {(settings?.memory_similarity_threshold || 0.7).toFixed(2)}</Label>
            <Slider
              value={[settings?.memory_similarity_threshold || 0.7]}
              onValueChange={(val) => updateSetting('memory_similarity_threshold', val[0])}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Memories to Search</Label>
              <Input type="number" value={settings?.memory_max_search || 100} onChange={(e) => updateSetting('memory_max_search', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max Memories to Use</Label>
              <Input type="number" value={settings?.memory_max_use || 5} onChange={(e) => updateSetting('memory_max_use', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max Solutions to Search</Label>
              <Input type="number" value={settings?.memory_max_solutions_search || 100} onChange={(e) => updateSetting('memory_max_solutions_search', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max Solutions to Use</Label>
              <Input type="number" value={settings?.memory_max_solutions_use || 3} onChange={(e) => updateSetting('memory_max_solutions_use', parseInt(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Auto-Memorize Enabled</Label>
              <p className="text-sm text-muted-foreground">Automatically store memories</p>
            </div>
            <Switch
              checked={settings?.auto_memorize_enabled || false}
              onCheckedChange={(checked) => updateSetting('auto_memorize_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Auto-Memorize AI Consolidation</Label>
              <p className="text-sm text-muted-foreground">Use AI to consolidate memories</p>
            </div>
            <Switch
              checked={settings?.auto_memorize_ai_consolidation || false}
              onCheckedChange={(checked) => updateSetting('auto_memorize_ai_consolidation', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Auto-Memorize Replacement Threshold: {(settings?.auto_memorize_threshold || 0.9).toFixed(2)}</Label>
            <Slider
              value={[settings?.auto_memorize_threshold || 0.9]}
              onValueChange={(val) => updateSetting('auto_memorize_threshold', val[0])}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Speech Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Speech & Audio</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Speech-to-Text Model Size</Label>
            <Select value={settings?.stt_model_size || ''} onValueChange={(val) => updateSetting('stt_model_size', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model size" />
              </SelectTrigger>
              <SelectContent>
                {additional?.stt_models?.map((model: any) => (
                  <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speech-to-Text Language Code</Label>
            <Input
              value={settings?.stt_language || 'en'}
              onChange={(e) => updateSetting('stt_language', e.target.value)}
              placeholder="e.g., en, fr, it"
            />
          </div>

          <div className="space-y-2">
            <Label>Microphone Silence Threshold: {(settings?.mic_silence_threshold || 0.5).toFixed(2)}</Label>
            <Slider
              value={[settings?.mic_silence_threshold || 0.5]}
              onValueChange={(val) => updateSetting('mic_silence_threshold', val[0])}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Microphone Silence Duration (ms)</Label>
            <Input
              type="number"
              value={settings?.mic_silence_duration || 1000}
              onChange={(e) => updateSetting('mic_silence_duration', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Microphone Waiting Timeout (ms)</Label>
            <Input
              type="number"
              value={settings?.mic_waiting_timeout || 30000}
              onChange={(e) => updateSetting('mic_waiting_timeout', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Enable Kokoro TTS</Label>
              <p className="text-sm text-muted-foreground">Text-to-speech synthesis</p>
            </div>
            <Switch
              checked={settings?.enable_kokoro_tts || false}
              onCheckedChange={(checked) => updateSetting('enable_kokoro_tts', checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
