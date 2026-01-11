
import { AttachmentPayload, ApiLogResponse, AgentConfig, BackupCreateConfig, RestorePreviewResult, Backup } from '../types';

const BASE_URL = '/api';

export interface AgentFile {
    name: string;
    type: 'file' | 'directory';
    size: number;
    path: string;
}

export interface SchedulerTask {
    id: string; // mapped from uuid
    name: string;
    cron: string;
    active: boolean; // mapped from enabled
    state?: 'IDLE' | 'RUNNING' | 'QUEUED' | 'PAUSED';
    next_run?: string;
    context_id?: string;
}

export interface MCPServer {
    name: string;
    status: 'connected' | 'error' | 'disconnected';
}

export interface A2AAgentParams {
    name: string;
    type: string;
    instruction: string;
    description?: string;
}

export interface Project {
    name: string;
    version?: string;
    description?: string;
    created_at?: string;
}

// Helper to handle base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const rawBase64 = result.split(',')[1];
            resolve(rawBase64);
        };
        reader.onerror = error => reject(error);
    });
};

class AgentService {
  private apiKey: string = '';

  setApiKey(key: string) {
      this.apiKey = key;
  }

  private async request<T>(endpoint: string, options: RequestInit & { silent?: boolean } = {}): Promise<T> {
    const { silent, ...fetchOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
        'X-API-Key': this.apiKey,
        ...fetchOptions.headers,
    };

    // Remove Content-Type for FormData (let browser set it)
    if (fetchOptions.body instanceof FormData) {
        // @ts-ignore
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            ...fetchOptions,
            headers,
        });
        
        // Handle Blob responses (e.g. download)
        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.includes('zip'))) {
             // @ts-ignore
             return response.blob() as T;
        }

        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        return response.json();
    } catch (error) {
        if (!silent) {
            console.error(`Request failed for ${endpoint}:`, error);
        }
        throw error;
    }
  }

  // --- Chat Management ---
  async sendMessage(
      contextId: string, 
      message: string, 
      files: File[] = []
  ): Promise<{ context_id: string, response: string }> {
      const attachments: AttachmentPayload[] = [];
      for (const file of files) {
          const base64 = await fileToBase64(file);
          attachments.push({
              filename: file.name,
              base64: base64
          });
      }
      return this.request('message', {
          method: 'POST',
          body: JSON.stringify({
              context_id: contextId,
              message: message,
              attachments: attachments,
              lifetime_hours: 24
          })
      });
  }

  async resetChat(contextId: string): Promise<void> {
      return this.request('reset_chat', {
          method: 'POST',
          body: JSON.stringify({ context_id: contextId })
      });
  }

  async terminateChat(contextId: string): Promise<void> {
      return this.request('terminate_chat', {
          method: 'POST',
          body: JSON.stringify({ context_id: contextId })
      });
  }

  async createChat(currentContextId?: string): Promise<{ ctxid: string, message: string }> {
      return this.request('create_chat', {
          method: 'POST',
          body: JSON.stringify({ current_context: currentContextId })
      });
  }

  async exportChat(contextId: string): Promise<{ content: any, message: string }> {
      return this.request('export_chat', {
          method: 'POST',
          body: JSON.stringify({ ctxid: contextId })
      });
  }

  async getChatFilesPath(contextId: string): Promise<{ path: string }> {
      return this.request('get_chat_files_path', {
          method: 'POST',
          body: JSON.stringify({ ctxid: contextId })
      });
  }

  // --- Logs & Files ---
  async getLogs(contextId: string, length: number = 100): Promise<ApiLogResponse> {
      try {
          return await this.request('log', {
              method: 'POST',
              body: JSON.stringify({ context_id: contextId, length }),
              silent: true
          });
      } catch (e) {
          return { context_id: contextId, log: { guid: '', total_items: 0, items: [] } };
      }
  }

  async getFiles(paths: string[]): Promise<Record<string, string>> {
      return this.request('files', {
          method: 'POST',
          body: JSON.stringify({ paths })
      });
  }

  async listFiles(path: string): Promise<AgentFile[]> {
      try {
          return await this.request('files/list', {
              method: 'POST',
              body: JSON.stringify({ path }),
              silent: true
          });
      } catch (e) {
          console.warn("List files failed, using mock data");
          if (!path) {
              return [
                  { name: 'workspace', type: 'directory', size: 0, path: 'workspace' },
                  { name: 'memory', type: 'directory', size: 0, path: 'memory' },
                  { name: 'logs', type: 'directory', size: 0, path: 'logs' },
                  { name: 'agent_config.json', type: 'file', size: 2048, path: 'agent_config.json' }
              ];
          }
          return [];
      }
  }

  async uploadFile(file: File, path: string): Promise<void> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      await fetch(`${BASE_URL}/files/upload`, {
          method: 'POST',
          headers: {
              'Authorization': this.apiKey,
              'X-API-Key': this.apiKey
          },
          body: formData
      });
  }

  async deleteFile(path: string): Promise<void> {
      return this.request('files/delete', {
          method: 'POST',
          body: JSON.stringify({ path })
      });
  }

  // --- Advanced Backups ---
  async getBackups(): Promise<Backup[]> {
      try {
          return await this.request('backups', { method: 'GET', silent: true });
      } catch (e) {
          console.warn("Backups endpoint missing, using mock data");
          return [
              { id: '1', name: 'snapshot-initial', timestamp: Date.now() - 86400000, size: 5242880 },
              { id: '2', name: 'snapshot-dev', timestamp: Date.now() - 3600000, size: 12582912 }
          ];
      }
  }

  async createBackup(config: BackupCreateConfig): Promise<Blob> {
      const response = await fetch(`${BASE_URL}/backup/create`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': this.apiKey,
              'X-API-Key': this.apiKey
          },
          body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('Backup creation failed');
      return response.blob();
  }

  async testBackupPatterns(config: BackupCreateConfig): Promise<any> {
      try {
        return await this.request('backup/test', {
            method: 'POST',
            body: JSON.stringify({
                include_patterns: config.include_patterns,
                exclude_patterns: config.exclude_patterns,
                include_hidden: config.include_hidden
            })
        });
      } catch (e) {
        return { total_count: 42, files: [{path: 'mock/file1.txt'}, {path: 'mock/file2.py'}], truncated: false };
      }
  }

  async previewRestore(file: File, metadata: any, overwritePolicy: string, clean: boolean): Promise<RestorePreviewResult> {
      try {
        const formData = new FormData();
        formData.append('backup_file', file);
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('overwrite_policy', overwritePolicy);
        formData.append('clean_before_restore', String(clean));

        const response = await fetch(`${BASE_URL}/backup/restore/preview`, {
            method: 'POST',
            headers: {
                'Authorization': this.apiKey,
                'X-API-Key': this.apiKey
            },
            body: formData
        });

        if (!response.ok) throw new Error('Preview failed');
        return response.json();
      } catch (e) {
         return {
             success: true,
             files_to_restore: ['config.json', 'memory.db'],
             files_to_delete: [],
             skipped_files: [],
             total_count: 2,
             backup_metadata: {}
         };
      }
  }

  async restoreBackup(file: File, metadata: any, overwritePolicy: string, clean: boolean): Promise<any> {
      const formData = new FormData();
      formData.append('backup_file', file);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('overwrite_policy', overwritePolicy);
      formData.append('clean_before_restore', String(clean));

      const response = await fetch(`${BASE_URL}/backup/restore`, {
          method: 'POST',
          headers: {
              'Authorization': this.apiKey,
              'X-API-Key': this.apiKey
          },
          body: formData
      });

      if (!response.ok) throw new Error('Restore failed');
      return response.json();
  }

  // --- Scheduler & MCP & Agents ---
  async getTasks(): Promise<SchedulerTask[]> {
      try {
          const response = await this.request<{ tasks: any[] }>('scheduler_tasks_list', { 
              method: 'POST', 
              body: JSON.stringify({}) 
          });
          
          if (!response || !response.tasks) return [];

          return response.tasks.map((t: any) => ({
              id: t.uuid,
              name: t.name,
              cron: t.cron || t.schedule,
              active: t.enabled,
              state: t.state,
              next_run: t.next_run,
              context_id: t.context_id
          }));
      } catch (e) {
          console.warn("Scheduler endpoints missing/failed", e);
          return [];
      }
  }

  async createTask(task: Partial<SchedulerTask>): Promise<void> {
      return this.request('scheduler_task_create', {
          method: 'POST',
          body: JSON.stringify({
              name: task.name,
              cron: task.cron,
              enabled: true
          })
      });
  }

  async updateTask(id: string, updates: Partial<SchedulerTask>): Promise<void> {
      // Map 'active' back to 'enabled' for the backend
      const payload: any = { task_id: id };
      if (updates.name) payload.name = updates.name;
      if (updates.cron) payload.cron = updates.cron;
      if (updates.active !== undefined) payload.enabled = updates.active;
      
      return this.request('scheduler_task_update', {
          method: 'POST',
          body: JSON.stringify(payload)
      });
  }

  async deleteTask(id: string): Promise<void> {
      return this.request('scheduler_task_delete', {
          method: 'POST',
          body: JSON.stringify({ task_id: id })
      });
  }

  async runTask(id: string): Promise<void> {
      return this.request('scheduler_task_run', {
          method: 'POST',
          body: JSON.stringify({ task_id: id })
      });
  }

  async getMCPServers(): Promise<MCPServer[]> {
      try {
        return await this.request('mcp/servers', { method: 'GET', silent: true });
      } catch (e) {
          console.warn("MCP Servers endpoint missing", e);
          return [
              { name: "Filesystem", status: "connected" },
              { name: "Brave Search", status: "connected" }
          ];
      }
  }

  async createAgent(agent: A2AAgentParams): Promise<void> {
      return this.request('agent/create', {
          method: 'POST',
          body: JSON.stringify(agent)
      });
  }

  // --- Projects ---
  async listProjects(): Promise<{ projects: Project[], active_project: string }> {
      const res = await this.request<{ data: any }>('projects', {
          method: 'POST',
          body: JSON.stringify({ action: 'list' })
      });
      return res.data;
  }

  async createProject(project: Partial<Project>): Promise<any> {
      const res = await this.request<{ data: any }>('projects', {
          method: 'POST',
          body: JSON.stringify({ action: 'create', project })
      });
      return res.data;
  }

  async updateProject(project: Partial<Project>): Promise<any> {
      const res = await this.request<{ data: any }>('projects', {
          method: 'POST',
          body: JSON.stringify({ action: 'update', project })
      });
      return res.data;
  }

  async deleteProject(name: string): Promise<any> {
      const res = await this.request<{ data: any }>('projects', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', name })
      });
      return res.data;
  }

  async activateProject(contextId: string, name: string): Promise<any> {
      const res = await this.request<{ data: any }>('projects', {
          method: 'POST',
          body: JSON.stringify({ action: 'activate', context_id: contextId, name })
      });
      return res.data;
  }
}

export const agentService = new AgentService();
