
export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  attachments?: string[]; // Array of filenames
}

export interface ChatSession {
  id: string; // This corresponds to context_id in Python backend
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface AttachmentPayload {
    filename: string;
    base64: string;
}

export interface LogItem {
    id: string;
    type: string;
    heading: string;
    content: string;
    kvps?: Record<string, any>;
    timestamp: number;
}

export interface ApiLogResponse {
    context_id: string;
    log: {
        guid: string;
        total_items: number;
        items: LogItem[];
    }
}

// Backup & Restore Types
export interface Backup {
    id: string;
    name: string;
    timestamp: number;
    size: number;
}

export interface BackupCreateConfig {
    backup_name: string;
    include_patterns: string[];
    exclude_patterns: string[];
    include_hidden: boolean;
}

export interface RestorePreviewResult {
    success: boolean;
    files_to_restore: string[];
    files_to_delete: string[];
    skipped_files: string[];
    total_count: number;
    backup_metadata: any;
    error?: string;
}

export interface AgentConfig {
    version: string;
    
    // Chat Model
    chat_model_provider: string;
    chat_model_name: string;
    chat_model_api_base: string;
    chat_model_kwargs: Record<string, any>;
    chat_model_ctx_length: number;
    chat_model_ctx_history: number;
    chat_model_vision: boolean;
    
    // Utility Model
    util_model_provider: string;
    util_model_name: string;
    util_model_api_base: string;
    util_model_ctx_length: number;
    util_model_ctx_input: number;
    util_model_kwargs: Record<string, any>;

    // Embedding Model
    embed_model_provider: string;
    embed_model_name: string;
    embed_model_api_base: string;
    embed_model_kwargs: Record<string, any>;

    // Browser Model
    browser_model_provider: string;
    browser_model_name: string;
    browser_model_api_base: string;
    browser_model_vision: boolean;
    browser_model_kwargs: Record<string, any>;
    browser_http_headers: Record<string, string>;

    // Memory - Recall
    memory_recall_enabled: boolean;
    memory_recall_delayed: boolean;
    memory_recall_interval: number;
    memory_recall_history_len: number;
    memory_recall_memories_max_search: number;
    memory_recall_solutions_max_search: number;
    memory_recall_memories_max_result: number;
    memory_recall_solutions_max_result: number;
    memory_recall_similarity_threshold: number;
    memory_recall_query_prep: boolean;
    memory_recall_post_filter: boolean;

    // Memory - Memorize
    memory_memorize_enabled: boolean;
    memory_memorize_consolidation: boolean;
    memory_memorize_replace_threshold: number;

    // Security & Auth
    api_keys: Record<string, string>;
    auth_login: string;
    auth_password: string;
    root_password: string;
    secrets: string;

    // System
    agent_profile: string;
    agent_memory_subdir: string;
    agent_knowledge_subdir: string;
    shell_interface: string;
    variables: string;
    update_check_enabled: boolean;

    // Connectivity (RFC, A2A, MCP)
    rfc_auto_docker: boolean;
    rfc_url: string;
    rfc_password: string;
    rfc_port_http: number;
    rfc_port_ssh: number;
    
    mcp_servers: string;
    mcp_client_init_timeout: number;
    mcp_client_tool_timeout: number;
    mcp_server_enabled: boolean;
    mcp_server_token: string;
    
    a2a_server_enabled: boolean;

    // Voice
    stt_model_size: string;
    stt_language: string;
    stt_silence_threshold: number;
    stt_silence_duration: number;
    stt_waiting_timeout: number;
    tts_kokoro: boolean;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
    version: "unknown",
    chat_model_provider: "openrouter",
    chat_model_name: "anthropic/claude-opus-4.5",
    chat_model_api_base: "",
    chat_model_kwargs: { "temperature": "0" },
    chat_model_ctx_length: 100000,
    chat_model_ctx_history: 0.7,
    chat_model_vision: true,
    
    util_model_provider: "openrouter",
    util_model_name: "xiaomi/mimo-v2-flash:free",
    util_model_api_base: "",
    util_model_ctx_length: 100000,
    util_model_ctx_input: 0.7,
    util_model_kwargs: { "temperature": "0" },

    embed_model_provider: "huggingface",
    embed_model_name: "sentence-transformers/all-MiniLM-L6-v2",
    embed_model_api_base: "",
    embed_model_kwargs: {},

    browser_model_provider: "openrouter",
    browser_model_name: "anthropic/claude-opus-4.5",
    browser_model_api_base: "",
    browser_model_vision: true,
    browser_model_kwargs: { "temperature": "0" },
    browser_http_headers: {},

    memory_recall_enabled: true,
    memory_recall_delayed: false,
    memory_recall_interval: 3,
    memory_recall_history_len: 10000,
    memory_recall_memories_max_search: 12,
    memory_recall_solutions_max_search: 8,
    memory_recall_memories_max_result: 5,
    memory_recall_solutions_max_result: 3,
    memory_recall_similarity_threshold: 0.7,
    memory_recall_query_prep: true,
    memory_recall_post_filter: true,

    memory_memorize_enabled: true,
    memory_memorize_consolidation: true,
    memory_memorize_replace_threshold: 0.9,

    api_keys: {},
    auth_login: "",
    auth_password: "",
    root_password: "",
    secrets: "",

    agent_profile: "agent0",
    agent_memory_subdir: "default",
    agent_knowledge_subdir: "custom",
    shell_interface: "local",
    variables: "",
    update_check_enabled: true,

    rfc_auto_docker: true,
    rfc_url: "localhost",
    rfc_password: "",
    rfc_port_http: 50001,
    rfc_port_ssh: 2222,

    mcp_servers: "{\n    \"mcpServers\": {}\n}",
    mcp_client_init_timeout: 10,
    mcp_client_tool_timeout: 120,
    mcp_server_enabled: true,
    mcp_server_token: "",

    a2a_server_enabled: true,

    stt_model_size: "base",
    stt_language: "en",
    stt_silence_threshold: 0.3,
    stt_silence_duration: 1000,
    stt_waiting_timeout: 2000,
    tts_kokoro: true
};

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type InputVariant = 'default' | 'filled';

export interface AIConfig {
    model: string;
    systemInstruction?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    thinkingBudget?: number;
}
