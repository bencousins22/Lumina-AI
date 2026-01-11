
import React, { useState, useEffect } from 'react';
import { Archive, Download, Eye, FileText, Upload, RotateCcw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
    Table, TableBody, TableCell, TableHead, 
    TableHeader, TableRow 
} from '../ui/table';
import { agentService } from '../../services/agentService';
import { Backup, RestorePreviewResult } from '../../types';
import { cn } from '../../lib/utils';

export const AgentBackups: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  // Create Config
  const [backupName, setBackupName] = useState('backup-' + new Date().toISOString().split('T')[0]);
  const [patterns, setPatterns] = useState('*\n!__pycache__\n!.git');
  const [includeHidden, setIncludeHidden] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Restore Config
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePolicy, setRestorePolicy] = useState('overwrite');
  const [cleanRestore, setCleanRestore] = useState(false);
  const [previewResult, setPreviewResult] = useState<RestorePreviewResult | null>(null);

  const loadBackups = async () => {
    try {
        const data = await agentService.getBackups();
        setBackups(Array.isArray(data) ? data : []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadBackups(); }, []);

  const handleTestPatterns = async () => {
      setLoading(true);
      try {
          const lines = patterns.split('\n').map(l => l.trim()).filter(Boolean);
          const include = lines.filter(l => !l.startsWith('!'));
          const exclude = lines.filter(l => l.startsWith('!')).map(l => l.substring(1));
          
          const result = await agentService.testBackupPatterns({
              backup_name: backupName,
              include_patterns: include,
              exclude_patterns: exclude,
              include_hidden: includeHidden
          });
          setTestResult(result);
      } catch (e: any) {
          setStatusMsg('Error testing patterns: ' + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleCreate = async () => {
      setLoading(true);
      try {
          const lines = patterns.split('\n').map(l => l.trim()).filter(Boolean);
          const blob = await agentService.createBackup({
              backup_name: backupName,
              include_patterns: lines.filter(l => !l.startsWith('!')),
              exclude_patterns: lines.filter(l => l.startsWith('!')).map(l => l.substring(1)),
              include_hidden: includeHidden
          });
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${backupName}.zip`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          loadBackups();
          setStatusMsg('Backup created & downloaded');
      } catch(e: any) {
          setStatusMsg('Failed: ' + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handlePreviewRestore = async () => {
      if (!restoreFile) return;
      setLoading(true);
      try {
          const res = await agentService.previewRestore(
              restoreFile, 
              { include_patterns: ['*'], exclude_patterns: [] }, 
              restorePolicy, 
              cleanRestore
          );
          setPreviewResult(res);
      } catch(e: any) {
          setStatusMsg('Preview Failed: ' + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleRestore = async () => {
      if (!restoreFile) return;
      if (!confirm('This action may overwrite files. Continue?')) return;
      
      setLoading(true);
      try {
          await agentService.restoreBackup(
              restoreFile,
              { include_patterns: ['*'], exclude_patterns: [] }, 
              restorePolicy, 
              cleanRestore
          );
          setStatusMsg('Restore Successful');
          setPreviewResult(null);
          setRestoreFile(null);
      } catch(e: any) {
          setStatusMsg('Restore Failed: ' + e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-background/50 animate-in fade-in duration-300">
      <Tabs defaultValue="list" className="flex flex-col h-full">
          <div className="flex justify-center mb-6 shrink-0">
              <TabsList>
                  <TabsTrigger value="list">Archives</TabsTrigger>
                  <TabsTrigger value="create">Create Snapshot</TabsTrigger>
                  <TabsTrigger value="restore">Restore</TabsTrigger>
              </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
              {statusMsg && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm flex justify-between items-center animate-in slide-in-from-top-2 mb-4">
                      <span>{statusMsg}</span>
                      <button onClick={() => setStatusMsg('')}><div className="w-4 h-4 rounded-full bg-white/10" /></button>
                  </div>
              )}

              <TabsContent value="list" className="m-0 h-full">
                  <div className="rounded-md border bg-card overflow-hidden">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Snapshot Name</TableHead>
                                  <TableHead>Date Created</TableHead>
                                  <TableHead className="text-right">Size</TableHead>
                                  <TableHead className="text-right">Download</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {backups.length === 0 ? (
                                  <TableRow>
                                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                          No remote snapshots found.
                                      </TableCell>
                                  </TableRow>
                              ) : (
                                  backups.map(b => (
                                      <TableRow key={b.id}>
                                          <TableCell className="font-medium flex items-center gap-2">
                                              <Archive size={16} className="text-primary" />
                                              {b.name}
                                          </TableCell>
                                          <TableCell className="text-muted-foreground">
                                              {new Date(b.timestamp).toLocaleString()}
                                          </TableCell>
                                          <TableCell className="text-right font-mono text-xs">
                                              {(b.size / 1024 / 1024).toFixed(1)} MB
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <Button size="icon" variant="ghost">
                                                  <Download size={16} />
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>
                  </div>
              </TabsContent>

              <TabsContent value="create" className="m-0 space-y-6 max-w-2xl mx-auto">
                  <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
                      <div className="space-y-2">
                          <Label htmlFor="backupName">Backup Name</Label>
                          <Input 
                            id="backupName"
                            value={backupName} 
                            onChange={e => setBackupName(e.target.value)} 
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <Label htmlFor="patterns" className="flex justify-between">
                              <span>Included Patterns</span>
                              <span className="text-xs opacity-70 font-normal">.gitignore syntax</span>
                          </Label>
                          <Textarea 
                              id="patterns"
                              className="h-32 font-mono"
                              value={patterns}
                              onChange={e => setPatterns(e.target.value)}
                              placeholder="path/to/include&#10;!path/to/exclude"
                          />
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <input 
                            type="checkbox" 
                            id="hidden-files"
                            checked={includeHidden} 
                            onChange={e => setIncludeHidden(e.target.checked)} 
                            className="rounded border-border bg-input text-primary focus:ring-primary h-4 w-4" 
                          />
                          <Label htmlFor="hidden-files" className="cursor-pointer font-normal">Include hidden files (.*)</Label>
                      </div>

                      <div className="flex gap-3 pt-2">
                          <Button variant="secondary" onClick={handleTestPatterns} disabled={loading} className="flex-1">
                              {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Eye size={14} className="mr-2" />}
                              Test Patterns
                          </Button>
                          <Button onClick={handleCreate} disabled={loading} className="flex-[2]">
                              {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Download size={14} className="mr-2" />}
                              Create & Download
                          </Button>
                      </div>
                  </div>

                  {testResult && (
                      <div className="mt-4 p-4 bg-card border border-border rounded-xl animate-in slide-in-from-bottom-4">
                          <h4 className="text-sm font-semibold mb-3 flex justify-between items-center pb-2 border-b border-border/50">
                              <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Match Preview</span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{testResult.total_count} files</span>
                          </h4>
                          <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1 text-muted-foreground custom-scrollbar">
                              {testResult.files.map((f: any, i: number) => (
                                  <div key={i} className="hover:text-foreground transition-colors">{f.path}</div>
                              ))}
                              {testResult.truncated && <div className="italic opacity-50">...and more</div>}
                          </div>
                      </div>
                  )}
              </TabsContent>

              <TabsContent value="restore" className="m-0 space-y-6 max-w-2xl mx-auto">
                  <div className="p-8 border-2 border-dashed border-border rounded-xl text-center hover:bg-muted/5 transition-all relative group cursor-pointer bg-card">
                      <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={e => setRestoreFile(e.target.files?.[0] || null)}
                          accept=".zip"
                      />
                      <div className="mb-4 p-4 bg-primary/5 text-primary rounded-full inline-block group-hover:scale-110 transition-transform">
                         <Upload size={32} />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Select Backup Archive</h3>
                      <p className="text-sm text-muted-foreground">{restoreFile ? restoreFile.name : 'Drop .zip file here or click to browse'}</p>
                  </div>

                  {restoreFile && (
                      <div className="space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <Label className="text-xs font-semibold uppercase text-muted-foreground">Policy</Label>
                                   <Select value={restorePolicy} onValueChange={setRestorePolicy}>
                                     <SelectTrigger>
                                       <SelectValue />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="overwrite">Overwrite Existing</SelectItem>
                                       <SelectItem value="skip">Skip Existing</SelectItem>
                                       <SelectItem value="backup">Backup Existing</SelectItem>
                                     </SelectContent>
                                   </Select>
                               </div>
                               <div className="space-y-2">
                                   <Label className="text-xs font-semibold uppercase text-muted-foreground">Safety</Label>
                                   <div 
                                      className={cn(
                                          "p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 text-sm transition-colors h-10",
                                          cleanRestore ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:bg-muted"
                                      )}
                                      onClick={() => setCleanRestore(!cleanRestore)}
                                   >
                                       <AlertTriangle size={14} />
                                       Clean destination first?
                                   </div>
                               </div>
                          </div>

                          <Button className="w-full" variant="secondary" onClick={handlePreviewRestore} disabled={loading}>
                              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
                              Preview Changes
                          </Button>
                      </div>
                  )}

                  {previewResult && (
                      <div className="space-y-4 animate-in slide-in-from-bottom-4">
                          <div className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-sm">
                              <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                  <FileText size={16} />
                                  Impact Analysis
                              </h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-3 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20">
                                      <div className="font-bold text-2xl">{previewResult.files_to_restore.length}</div>
                                      <div className="text-xs font-medium uppercase tracking-wide opacity-80">Restore</div>
                                  </div>
                                  <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                                      <div className="font-bold text-2xl">{previewResult.files_to_delete.length}</div>
                                      <div className="text-xs font-medium uppercase tracking-wide opacity-80">Delete</div>
                                  </div>
                                  <div className="p-3 bg-gray-500/10 rounded-xl text-gray-400 border border-gray-500/20">
                                      <div className="font-bold text-2xl">{previewResult.skipped_files.length}</div>
                                      <div className="text-xs font-medium uppercase tracking-wide opacity-80">Skip</div>
                                  </div>
                              </div>
                          </div>

                          <Button className="w-full" onClick={handleRestore} disabled={loading} size="lg">
                               {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <RotateCcw size={16} className="mr-2" />}
                              Confirm & Restore
                          </Button>
                      </div>
                  )}
              </TabsContent>
          </div>
      </Tabs>
    </div>
  );
};
