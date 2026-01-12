
import React, { useState, useEffect } from 'react';
import { 
    FolderGit2, Plus, Search, MoreVertical, Trash2, Edit2, 
    Power, Loader2, FileCode, CheckCircle2, AlertCircle,
    LayoutGrid, List as ListIcon, Calendar, Box, Activity,
    GitBranch, Database, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter, DialogClose 
} from '../ui/dialog';
import { 
    Table, TableBody, TableCell, TableHead, 
    TableHeader, TableRow 
} from '../ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Toggle } from '../ui/toggle';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { agentService, Project } from '../../services/agentService';
import { cn } from '../../lib/utils';

interface AgentProjectsProps {
    currentContextId?: string;
}

export const AgentProjects: React.FC<AgentProjectsProps> = ({ currentContextId }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('all');
    const [totalKnowledgeCount, setTotalKnowledgeCount] = useState<number>(0);

    // Create/Edit State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await agentService.listProjects();
            if (data) {
                const list = Array.isArray(data) ? data : (data.projects || []);
                const active = (data as any).active_project || '';
                setProjects(list);
                setActiveProject(active);

                // Fetch memory stats for all projects
                let totalKnowledge = 0;
                for (const project of list) {
                    try {
                        const stats = await agentService.getMemoryStats(project.name);
                        totalKnowledge += stats.knowledge;
                    } catch (e) {
                        console.error(`Failed to fetch stats for ${project.name}:`, e);
                    }
                }
                setTotalKnowledgeCount(totalKnowledge);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenCreate = () => {
        setEditingProject(null);
        setFormData({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({ name: project.name, description: project.description || '' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) return;
        setActionLoading(true);
        try {
            if (editingProject) {
                await agentService.updateProject({ ...formData });
            } else {
                await agentService.createProject({ ...formData });
            }
            setIsDialogOpen(false);
            fetchProjects();
        } catch (e) {
            console.error(e);
            alert("Operation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm(`Are you sure you want to delete project "${name}"? This cannot be undone.`)) return;
        try {
            await agentService.deleteProject(name);
            fetchProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const handleActivate = async (name: string) => {
        if (!currentContextId) {
            alert("No active chat context found. Please start a chat first.");
            return;
        }
        try {
            await agentService.activateProject(currentContextId, name);
            setActiveProject(name);
        } catch (e) {
            console.error(e);
            alert("Failed to activate project");
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || 
                           (activeTab === 'active' && p.name === activeProject) ||
                           (activeTab === 'archived' && false); 
        return matchesSearch && matchesTab;
    });

    const StatsCard = ({ title, value, icon: Icon, colorClass }: any) => (
        <Card className="flex-1 border border-border/50 shadow-sm relative overflow-hidden bg-card/50">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-2.5 rounded-xl bg-background/80 border border-border/50", colorClass)}>
                    <Icon size={20} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300 p-1">
            {/* Header Section */}
            <div className="flex flex-col gap-6 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                        <p className="text-muted-foreground">Manage workspaces, contexts, and isolated environments.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="shadow-lg shadow-primary/20">
                        <Plus size={16} className="mr-2" /> New Project
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard 
                        title="Total Projects" 
                        value={projects.length} 
                        icon={FolderGit2} 
                        colorClass="text-blue-500"
                    />
                    <StatsCard 
                        title="Active Workspace" 
                        value={activeProject ? "Online" : "None"} 
                        icon={Activity} 
                        colorClass={activeProject ? "text-emerald-500" : "text-muted-foreground"}
                    />
                    <StatsCard
                        title="Knowledge Bases"
                        value={totalKnowledgeCount}
                        icon={Database}
                        colorClass="text-amber-500"
                    /> 
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-muted/40 border border-border/50 h-9">
                        <TabsTrigger value="all" className="text-xs">All Projects</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                        <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search projects..." 
                            className="pl-9 h-9 bg-muted/40 border-border/50 focus-visible:ring-1" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 h-9">
                        <Toggle
                            pressed={viewMode === 'grid'}
                            onPressedChange={() => setViewMode('grid')}
                            size="sm"
                            className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                        >
                            <LayoutGrid size={14} />
                        </Toggle>
                        <Toggle
                            pressed={viewMode === 'list'}
                            onPressedChange={() => setViewMode('list')}
                            size="sm"
                            className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                        >
                            <ListIcon size={14} />
                        </Toggle>
                    </div>
                </div>
            </div>

            {/* Content Grid/List */}
            <div className="flex-1 overflow-y-auto min-h-0 workspace-scroll pr-1 pb-4">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl bg-muted/20" />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-muted/5 mt-4">
                        <div className="p-4 rounded-full bg-muted/30 mb-3">
                            <FolderGit2 className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-sm font-medium">No projects found</h3>
                        <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                            {searchQuery ? "Try adjusting your search filters." : "Create your first project to get started."}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProjects.map((project) => (
                            <Card 
                                key={project.name} 
                                className={cn(
                                    "flex flex-col transition-all duration-200 group relative overflow-hidden border",
                                    activeProject === project.name 
                                        ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]" 
                                        : "border-border/60 bg-card hover:border-primary/20 hover:shadow-md"
                                )}
                            >
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors", 
                                            activeProject === project.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                                        )}>
                                            <FolderGit2 size={18} />
                                        </div>
                                        {activeProject === project.name && (
                                            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                <span className="relative flex h-1.5 w-1.5">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                </span>
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-base font-semibold truncate leading-tight">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs h-8 mt-1.5">
                                        {project.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="px-5 py-2 flex-1">
                                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md border border-border/30">
                                            <GitBranch size={10} />
                                            <span>v{project.version || '0.1'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md border border-border/30">
                                            <Clock size={10} />
                                            <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="px-5 py-4 border-t border-border/40 bg-muted/5 flex justify-between items-center gap-3">
                                    <Button 
                                        variant={activeProject === project.name ? "outline" : "default"} 
                                        size="sm" 
                                        className={cn("flex-1 h-8 text-xs shadow-none", activeProject !== project.name && "hover:bg-primary/90")}
                                        onClick={() => handleActivate(project.name)}
                                        disabled={activeProject === project.name}
                                    >
                                        <Power size={12} className="mr-1.5" />
                                        {activeProject === project.name ? "Running" : "Activate"}
                                    </Button>
                                    
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-background border border-transparent hover:border-border/50" onClick={() => handleOpenEdit(project)}>
                                            <Edit2 size={14} className="text-muted-foreground" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20" onClick={() => handleDelete(project.name)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[30%]">Project</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Modified</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.map((project) => (
                                    <TableRow key={project.name} className="group hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-1.5 rounded-lg border border-border/50 bg-background", activeProject === project.name ? "text-primary border-primary/20" : "text-muted-foreground")}>
                                                    <FolderGit2 size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground">{project.name}</span>
                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{project.description || "No description"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {activeProject === project.name ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground px-2">Inactive</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">v{project.version || '0.1'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleActivate(project.name)} disabled={activeProject === project.name}>
                                                    Activate
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenEdit(project)}>
                                                    <Edit2 size={12} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(project.name)}>
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md w-full">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <FolderGit2 size={20} />
                            </div>
                            {editingProject ? 'Edit Project' : 'New Project'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the project details. Projects isolate files, memory, and settings.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input 
                                id="name" 
                                placeholder="my-awesome-agent" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                disabled={!!editingProject}
                                className="font-mono text-sm"
                            />
                            {!editingProject && (
                                <p className="text-[10px] text-muted-foreground">
                                    Unique identifier for workspace folder generation.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <textarea 
                                id="desc"
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Describe the purpose..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit} disabled={actionLoading}>
                            {actionLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                            {editingProject ? 'Save Changes' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
