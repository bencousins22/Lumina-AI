
import { AttachmentPayload, ApiLogResponse, AgentConfig, BackupCreateConfig, RestorePreviewResult, Backup } from '../types';

// Use config from window if available, otherwise default to root
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).AGENT_ZERO_CONFIG) {
    return (window as any).AGENT_ZERO_CONFIG.apiBaseUrl;
  }
  // Default to localhost:50080 for Electron integration (no /api suffix - endpoints are at root)
  return 'http://localhost:50080';
};

const BASE_URL = getBaseUrl();

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
  private csrfToken: string = '';
  private csrfPromise: Promise<void> | null = null;

  setApiKey(key: string) {
      this.apiKey = key;
  }

  // Call this after login to fetch CSRF token
  async fetchCsrfToken(): Promise<void> {
    this.csrfToken = ''; // Reset token
    this.csrfPromise = null;
    return this.ensureCsrfToken();
  }

  private async ensureCsrfToken(): Promise<void> {
    if (this.csrfToken) return;

    // Prevent multiple concurrent CSRF token fetches
    if (this.csrfPromise) {
      return this.csrfPromise;
    }

    this.csrfPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/csrf_token`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.token) {
            this.csrfToken = data.token;
            console.log('CSRF token fetched successfully');
          }
        } else {
          console.warn('Failed to fetch CSRF token - not authenticated?');
        }
      } catch (error) {
        console.warn('Failed to fetch CSRF token:', error);
      } finally {
        this.csrfPromise = null;
      }
    })();

    return this.csrfPromise;
  }

  private async request<T>(endpoint: string, options: RequestInit & { silent?: boolean } = {}): Promise<T> {
    // Fetch CSRF token if needed (skip only for csrf_token endpoint itself)
    // All authenticated API endpoints require CSRF token, including GET requests
    if (endpoint !== 'csrf_token') {
      await this.ensureCsrfToken();
    }

    const { silent, ...fetchOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
        'X-API-Key': this.apiKey,
        'X-CSRF-Token': this.csrfToken,
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
            credentials: 'include', // Include cookies for session management
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
      return this.request('api_message', {
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
      return this.request('api_reset_chat', {
          method: 'POST',
          body: JSON.stringify({ context_id: contextId })
      });
  }

  async terminateChat(contextId: string): Promise<void> {
      return this.request('api_terminate_chat', {
          method: 'POST',
          body: JSON.stringify({ context_id: contextId })
      });
  }

  async createChat(currentContextId?: string): Promise<{ ctxid: string, message: string }> {
      return this.request('chat_create', {
          method: 'POST',
          body: JSON.stringify({ current_context: currentContextId })
      });
  }

  async exportChat(contextId: string): Promise<{ content: any, message: string }> {
      return this.request('chat_export', {
          method: 'POST',
          body: JSON.stringify({ ctxid: contextId })
      });
  }

  async getChatFilesPath(contextId: string): Promise<{ path: string }> {
      return this.request('chat_files_path_get', {
          method: 'POST',
          body: JSON.stringify({ ctxid: contextId })
      });
  }

  // --- Logs & Files ---
  async getLogs(contextId: string, length: number = 100): Promise<ApiLogResponse> {
      try {
          return await this.request('api_log_get', {
              method: 'POST',
              body: JSON.stringify({ context_id: contextId, length }),
              silent: true
          });
      } catch (e) {
          return { context_id: contextId, log: { guid: '', total_items: 0, items: [] } };
      }
  }

  async getFiles(paths: string[]): Promise<Record<string, string>> {
      return this.request('api_files_get', {
          method: 'POST',
          body: JSON.stringify({ paths })
      });
  }

  async listFiles(path: string): Promise<AgentFile[]> {
      return this.request('get_work_dir_files', {
          method: 'POST',
          body: JSON.stringify({ path }),
          silent: true
      });
  }

  async uploadFile(file: File, path: string): Promise<void> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      await fetch(`${BASE_URL}/upload_work_dir_files`, {
          method: 'POST',
          headers: {
              'Authorization': this.apiKey,
              'X-API-Key': this.apiKey
          },
          body: formData
      });
  }

  async deleteFile(path: string): Promise<void> {
      return this.request('delete_work_dir_file', {
          method: 'POST',
          body: JSON.stringify({ path })
      });
  }

  // --- Advanced Backups ---
  async getBackups(): Promise<Backup[]> {
      return this.request('backup_get_defaults', { method: 'GET', silent: true });
  }

  async createBackup(config: BackupCreateConfig): Promise<Blob> {
      const response = await fetch(`${BASE_URL}/backup_create`, {
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
      return this.request('backup_test', {
          method: 'POST',
          body: JSON.stringify({
              include_patterns: config.include_patterns,
              exclude_patterns: config.exclude_patterns,
              include_hidden: config.include_hidden
          })
      });
  }

  async previewRestore(file: File, metadata: any, overwritePolicy: string, clean: boolean): Promise<RestorePreviewResult> {
      const formData = new FormData();
      formData.append('backup_file', file);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('overwrite_policy', overwritePolicy);
      formData.append('clean_before_restore', String(clean));

      const response = await fetch(`${BASE_URL}/backup_restore_preview`, {
          method: 'POST',
          headers: {
              'Authorization': this.apiKey,
              'X-API-Key': this.apiKey
          },
          body: formData
      });

      if (!response.ok) throw new Error('Preview failed');
      return response.json();
  }

  async restoreBackup(file: File, metadata: any, overwritePolicy: string, clean: boolean): Promise<any> {
      const formData = new FormData();
      formData.append('backup_file', file);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('overwrite_policy', overwritePolicy);
      formData.append('clean_before_restore', String(clean));

      const response = await fetch(`${BASE_URL}/backup_restore`, {
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
      const res = await this.request<{ success: boolean, status: any }>('mcp_servers_status', { method: 'GET' });
      if (!res.success) return [];
      
      // Map status object to MCPServer[]
      return Object.entries(res.status).map(([name, status]: [string, any]) => ({
          name,
          status: status.connected ? 'connected' : 'disconnected'
      }));
  }

  async createAgent(agent: A2AAgentParams): Promise<void> {
      await this.request('subagents', {
          method: 'POST',
          body: JSON.stringify({ action: 'save', name: agent.name, data: agent })
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

  // --- Subagents (A2A) ---
  async listSubagents(): Promise<any[]> {
      try {
          const res = await this.request<{ ok: boolean, data: any }>('subagents', {
              method: 'POST',
              body: JSON.stringify({ action: 'list' })
          });
          return res.ok ? res.data : [];
      } catch (e) {
          return [];
      }
  }

  async loadSubagent(name: string): Promise<any> {
      const res = await this.request<{ ok: boolean, data: any }>('subagents', {
          method: 'POST',
          body: JSON.stringify({ action: 'load', name })
      });
      return res.data;
  }

  async saveSubagent(name: string, data: any): Promise<any> {
      const res = await this.request<{ ok: boolean, data: any }>('subagents', {
          method: 'POST',
          body: JSON.stringify({ action: 'save', name, data })
      });
      return res.data;
  }

  async deleteSubagent(name: string): Promise<void> {
      await this.request('subagents', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', name })
      });
  }

  // --- MCP Server Details ---
  async getMCPServerDetail(name: string): Promise<any> {
      try {
          return await this.request('mcp_server_get_detail', {
              method: 'POST',
              body: JSON.stringify({ name })
          });
      } catch (e) {
          return null;
      }
  }

  async getMCPServerLog(name: string, lines: number = 100): Promise<any> {
        try {
            return await this.request('mcp_server_get_log', {
                method: 'POST',
                body: JSON.stringify({ name, lines })
            });
        } catch (e) {
            return { log: [] };
        }
    }

    async applyMCPServers(config: any): Promise<any> {
        return this.request('mcp_servers_apply', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    // --- System Control ---
    async restart(): Promise<void> {
        return this.request('restart', { method: 'POST' });
    }

    async pause(contextId: string, paused: boolean): Promise<any> {
        return this.request('pause', {
            method: 'POST',
            body: JSON.stringify({ context: contextId, paused })
        });
    }

    async nudge(contextId: string): Promise<any> {
        return this.request('nudge', {
            method: 'POST',
            body: JSON.stringify({ ctxid: contextId })
        });
    }

    // --- Settings ---
    async getSettings(): Promise<any> {
        return this.request('settings_get', { method: 'GET' });
    }

    async setSettings(settings: any): Promise<any> {
        return this.request('settings_set', {
            method: 'POST',
            body: JSON.stringify({ settings })
        });
    }

    // --- Knowledge & History ---
    async importKnowledge(contextId: string, files: File[]): Promise<any> {
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        formData.append('ctxid', contextId);

        const response = await fetch(`${BASE_URL}/import_knowledge`, {
            method: 'POST',
            headers: {
                'Authorization': this.apiKey,
                'X-API-Key': this.apiKey,
                'X-CSRF-Token': this.csrfToken
            },
            body: formData
        });

        if (!response.ok) throw new Error('Knowledge import failed');
        return response.json();
    }

    async getContext(contextId: string): Promise<any> {
        return this.request('ctx_window_get', {
            method: 'POST',
            body: JSON.stringify({ context: contextId })
        });
    }

    async getHistory(contextId: string): Promise<any> {
        return this.request('history_get', {
            method: 'POST',
            body: JSON.stringify({ context: contextId })
        });
    }

    // --- Voice ---
    async transcribe(file: File, language?: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        if (language) formData.append('language', language);

        const response = await fetch(`${BASE_URL}/transcribe`, {
            method: 'POST',
            headers: {
                'Authorization': this.apiKey,
                'X-API-Key': this.apiKey,
                'X-CSRF-Token': this.csrfToken
            },
            body: formData
        });

        if (!response.ok) throw new Error('Transcription failed');
        return response.json();
    }

    async synthesize(text: string, voice?: string): Promise<Blob> {
        const response = await fetch(`${BASE_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.apiKey,
                'X-API-Key': this.apiKey,
                'X-CSRF-Token': this.csrfToken
            },
            body: JSON.stringify({ text, voice })
        });

        if (!response.ok) throw new Error('Synthesis failed');
        return response.blob();
    }

    // --- Notifications & Banners ---
    async getBanners(): Promise<any[]> {
        return this.request('banners', { method: 'GET', silent: true });
    }

    async getNotifications(): Promise<any[]> {
        const res = await this.request<{ items: any[] }>('notifications_history', { method: 'GET' });
        return res.items || [];
    }

    async markNotificationRead(id: string): Promise<void> {
        await this.request('notifications_mark_read', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
    }

    async clearNotifications(): Promise<void> {
        await this.request('notifications_clear', { method: 'POST' });
    }
}

export const agentService = new AgentService();
