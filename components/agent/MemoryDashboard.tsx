import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { agentService } from '../../services/agentService';
import { Brain, Search, Trash2, Plus, RefreshCw, Database, Sparkles, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'context' | 'knowledge' | 'history';
  metadata?: any;
}

export const MemoryDashboard: React.FC<{ currentContextId?: string }> = ({ currentContextId }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'context' | 'knowledge' | 'history'>('all');

  useEffect(() => {
    loadMemories();
  }, [currentContextId]);

  const loadMemories = async () => {
    if (!currentContextId) return;

    setIsLoading(true);
    try {
      const [context, history] = await Promise.all([
        agentService.getContext(currentContextId),
        agentService.getHistory(currentContextId),
      ]);

      const memoryEntries: MemoryEntry[] = [];

      // Process context window
      if (context?.messages) {
        context.messages.forEach((msg: any, idx: number) => {
          memoryEntries.push({
            id: `ctx-${idx}`,
            content: msg.content || '',
            timestamp: Date.now() - (context.messages.length - idx) * 1000,
            type: 'context',
            metadata: msg,
          });
        });
      }

      // Process history
      if (history?.items) {
        history.items.forEach((item: any, idx: number) => {
          memoryEntries.push({
            id: `hist-${idx}`,
            content: item.content || item.message || '',
            timestamp: item.timestamp || Date.now(),
            type: 'history',
            metadata: item,
          });
        });
      }

      setMemories(memoryEntries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMemories = memories.filter(mem => {
    const matchesType = selectedType === 'all' || mem.type === selectedType;
    const matchesSearch = !searchQuery || mem.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'context': return <Database size={14} className="text-blue-500" />;
      case 'knowledge': return <Brain size={14} className="text-purple-500" />;
      case 'history': return <Clock size={14} className="text-emerald-500" />;
      default: return <Sparkles size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'context': return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      case 'knowledge': return 'bg-purple-500/10 border-purple-500/20 text-purple-500';
      case 'history': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      default: return 'bg-muted border-border';
    }
  };

  if (!currentContextId) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Brain size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a chat session to view its memory</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Memory Dashboard</h2>
              <p className="text-sm text-muted-foreground">Context window and conversation history</p>
            </div>
          </div>
          <Button onClick={loadMemories} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {(['all', 'context', 'knowledge', 'history'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors capitalize",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted-foreground/10"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-primary" />
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Database size={48} className="mb-4 opacity-50" />
            <p>No memories found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemories.map((memory) => (
              <Card
                key={memory.id}
                className={cn("border transition-all hover:shadow-md", getTypeColor(memory.type))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-1.5 bg-background/50 rounded">
                        {getTypeIcon(memory.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium capitalize">{memory.type}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(memory.timestamp)}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{memory.content}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {memories.filter(m => m.type === 'context').length}
            </div>
            <div className="text-xs text-muted-foreground">Context</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">
              {memories.filter(m => m.type === 'knowledge').length}
            </div>
            <div className="text-xs text-muted-foreground">Knowledge</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">
              {memories.filter(m => m.type === 'history').length}
            </div>
            <div className="text-xs text-muted-foreground">History</div>
          </div>
        </div>
      </div>
    </div>
  );
};
