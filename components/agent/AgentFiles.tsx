
import React, { useState, useEffect } from 'react';
import { 
    File, Folder, Download, Trash2, Upload, RefreshCw, Home, 
    ChevronRight, CornerLeftUp, Loader2, Search, LayoutGrid, 
    List as ListIcon, FileText, FileCode, Image as ImageIcon,
    FileJson, FileArchive, MoreVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Toggle } from '../ui/toggle';
import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { agentService, AgentFile } from '../../services/agentService';
import { cn } from '../../lib/utils';

export const AgentFiles: React.FC = () => {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await agentService.listFiles(currentPath);
      setFiles(Array.isArray(data) ? data : []); 
    } catch (e) {
      console.error("Failed to load files", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLoading(true);
      try {
        await agentService.uploadFile(e.target.files[0], currentPath);
        await loadFiles();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
      await agentService.deleteFile(path);
      loadFiles();
    }
  };
  
  const handleNavigateUp = () => {
      if (!currentPath) return;
      const parts = currentPath.split('/');
      parts.pop();
      setCurrentPath(parts.join('/'));
  };

  const handleNavigate = (folderName: string) => {
      setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
  }

  const getFileIcon = (name: string, type: string, size: number = 20) => {
      if (type === 'directory') return <Folder size={size} className="text-blue-500 fill-blue-500/20" />;
      const ext = name.split('.').pop()?.toLowerCase();
      switch (ext) {
          case 'png': case 'jpg': case 'jpeg': case 'gif': return <ImageIcon size={size} className="text-purple-500" />;
          case 'json': return <FileJson size={size} className="text-yellow-500" />;
          case 'js': case 'ts': case 'tsx': case 'py': case 'html': case 'css': return <FileCode size={size} className="text-cyan-500" />;
          case 'zip': case 'tar': case 'gz': return <FileArchive size={size} className="text-red-500" />;
          case 'txt': case 'md': return <FileText size={size} className="text-slate-500" />;
          default: return <File size={size} className="text-slate-400" />;
      }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
      
      {/* Header with Actions */}
      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">Files</h2>
                <p className="text-muted-foreground">Browse and manage agent workspace files.</p>
             </div>
             <div className="flex gap-2">
                 <div className="relative group">
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleUpload} />
                     <Button>
                         <Upload size={16} className="mr-2" /> Upload
                     </Button>
                 </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
             {/* Breadcrumbs */}
             <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-lg border border-border/50 text-sm overflow-x-auto max-w-full flex-1">
                <button 
                    onClick={() => setCurrentPath('')} 
                    className={cn("p-1.5 rounded hover:bg-background transition-colors", !currentPath && "text-primary bg-background shadow-sm")}
                >
                    <Home size={14} />
                </button>
                {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                        <ChevronRight size={12} className="text-muted-foreground/50" />
                        <span className="font-medium px-1 text-xs">{part}</span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search..." 
                        className="pl-9 h-9" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
                    <Toggle pressed={viewMode === 'grid'} onPressedChange={() => setViewMode('grid')} size="sm">
                        <LayoutGrid size={14} />
                    </Toggle>
                    <Toggle pressed={viewMode === 'list'} onPressedChange={() => setViewMode('list')} size="sm">
                        <ListIcon size={14} />
                    </Toggle>
                </div>
                <Button size="icon" variant="ghost" onClick={loadFiles} disabled={loading} className="h-9 w-9">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </Button>
            </div>
          </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-card/50 rounded-xl border border-border/50 shadow-sm relative">
        {loading && (
             <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                 <Loader2 className="animate-spin text-primary" />
             </div>
        )}

        {filteredFiles.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Folder size={32} className="opacity-40" />
                </div>
                <p>No files found {currentPath && `in ${currentPath}`}</p>
                {currentPath && (
                     <Button variant="link" onClick={handleNavigateUp} className="mt-2">Go Up Directory</Button>
                )}
            </div>
        )}

        {viewMode === 'list' ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[60%] pl-6">Name</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentPath && (
                        <TableRow onClick={handleNavigateUp} className="cursor-pointer hover:bg-muted/50">
                            <TableCell colSpan={3} className="pl-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <CornerLeftUp size={16} />
                                    <span className="font-medium">..</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {filteredFiles.map((file, i) => (
                        <TableRow key={i} className="group">
                            <TableCell className="pl-6">
                                <div 
                                    className="flex items-center gap-3 cursor-pointer select-none"
                                    onClick={() => file.type === 'directory' && handleNavigate(file.name)}
                                >
                                    {getFileIcon(file.name, file.type, 18)}
                                    <span className="font-medium text-sm">{file.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                {file.size ? (file.size / 1024).toFixed(1) + ' KB' : '-'}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDelete(file.path, e)}>
                                        <Trash2 size={14} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <Download size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentPath && (
                    <Card 
                        className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
                        onClick={handleNavigateUp}
                    >
                        <CornerLeftUp size={24} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Back</span>
                    </Card>
                )}
                {filteredFiles.map((file, i) => (
                    <Card 
                        key={i}
                        className="aspect-square flex flex-col items-center justify-center p-4 cursor-pointer hover:border-primary/50 transition-all group relative"
                        onClick={() => file.type === 'directory' && handleNavigate(file.name)}
                    >
                        <div className="flex-1 flex items-center justify-center w-full">
                            {getFileIcon(file.name, file.type, 42)}
                        </div>
                        <div className="w-full mt-3">
                            <p className="text-xs font-medium text-center truncate w-full" title={file.name}>{file.name}</p>
                            <p className="text-[10px] text-muted-foreground text-center mt-0.5">{file.size ? (file.size / 1024).toFixed(0) + ' KB' : 'Dir'}</p>
                        </div>
                        
                        {/* Overlay Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => handleDelete(file.path, e)}
                                className="p-1.5 bg-background/90 rounded-md hover:text-destructive shadow-sm border border-border"
                             >
                                 <Trash2 size={12} />
                             </button>
                             <button className="p-1.5 bg-background/90 rounded-md hover:text-primary shadow-sm border border-border">
                                 <Download size={12} />
                             </button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
