
import React, { useState, useEffect } from 'react';
import { 
    FolderGit2, Plus, Search, MoreVertical, Trash2, Edit2, 
    Power, Loader2, FileCode, CheckCircle2, AlertCircle,
    LayoutGrid, List as ListIcon, Calendar, Box, Activity,
    GitBranch, Database
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
                           (activeTab === 'archived' && false); // Mock archived logic
        return matchesSearch && matchesTab;
    });

    const StatsCard = ({ title, value, icon: Icon, colorClass, gradientClass }: any) => (
        <Card className="flex-1 border-0 shadow-md relative overflow-hidden group">
            <div className={cn("absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20", gradientClass)} />
            <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm", colorClass)}>
                    <Icon size={24} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
            {/* Enterprise Header */}
            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                        <p className="text-muted-foreground">Manage your agent workspaces and knowledge bases.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="shadow-lg shadow-primary/20">
                        <Plus size={16} className="mr-2" /> Create Project
                    </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard 
                        title="Total Projects" 
                        value={projects.length} 
                        icon={FolderGit2} 
                        colorClass="text-blue-500"
                        gradientClass="bg-gradient-to-br from-blue-500 to-indigo-500"
                    />
                    <StatsCard 
                        title="Active Workspace" 
                        value={activeProject ? "1" : "0"} 
                        icon={Activity} 
                        colorClass="text-emerald-500"
                        gradientClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                    />
                    <StatsCard 
                        title="Knowledge Bases" 
                        value={projects.length * 2} 
                        icon={Database} 
                        colorClass="text-amber-500"
                        gradientClass="bg-gradient-to-br from-amber-500 to-orange-500"
                    /> 
                </div>
            </div>

            <Separator />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                        <TabsList className="bg-muted/50 border border-border/50">
                            <TabsTrigger value="all">All Projects</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter projects..." 
                                className="pl-9 h-9 bg-muted/30 border-border/50" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                            <Toggle
                                pressed={viewMode === 'grid'}
                                onPressedChange={() => setViewMode('grid')}
                                size="sm"
                                aria-label="Grid view"
                                className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
                            >
                                <LayoutGrid size={16} />
                            </Toggle>
                            <Toggle
                                pressed={viewMode === 'list'}
                                onPressedChange={() => setViewMode('list')}
                                size="sm"
                                aria-label="List view"
                                className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
                            >
                                <ListIcon size={16} />
                            </Toggle>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-1 workspace-scroll">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                            <FolderGit2 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No projects found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ? "Try adjusting your filters." : "Get started by creating a new project."}
                            </p>
                            {!searchQuery && (
                                <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                                    Create Project
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {filteredProjects.map((project) => (
                                <Card 
                                    key={project.name} 
                                    className={cn(
                                        "flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden",
                                        activeProject === project.name ? "border-primary/50 ring-1 ring-primary/20 bg-primary/5" : "bg-card"
                                    )}
                                >
                                    {activeProject === project.name && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full -mr-8 -mt-8" />
                                    )}
                                    <CardHeader className="pb-3 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2.5 rounded-xl shadow-sm transition-colors", 
                                                    activeProject === project.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                )}>
                                                    <FolderGit2 size={20} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base font-semibold truncate pr-4">
                                                        {project.name}
                                                    </CardTitle>
                                                    {activeProject === project.name ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-primary mt-0.5">
                                                            <Activity size={10} className="animate-pulse" /> Active Workspace
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground mt-0.5">Inactive</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <CardDescription className="line-clamp-2 text-xs h-8 mt-3 leading-relaxed">
                                            {project.description || "No description provided."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-3">
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded border border-border/50">
                                                <GitBranch size={10} />
                                                <span>v{project.version || '0.1.0'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded border border-border/50">
                                                <Calendar size={10} />
                                                <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Just now'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-3 border-t bg-muted/10 flex justify-between gap-2">
                                        <Button 
                                            variant={activeProject === project.name ? "outline" : "default"} 
                                            size="sm" 
                                            className={cn("flex-1 h-8 text-xs font-medium shadow-sm", activeProject !== project.name && "bg-primary/90 hover:bg-primary")}
                                            onClick={() => handleActivate(project.name)}
                                            disabled={activeProject === project.name}
                                        >
                                            <Power size={12} className="mr-1.5" />
                                            {activeProject === project.name ? "Active" : "Activate"}
                                        </Button>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background" onClick={() => handleOpenEdit(project)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(project.name)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-card">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Project Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.map((project) => (
                                        <TableRow key={project.name} className="group hover:bg-muted/30">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg transition-colors", activeProject === project.name ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                        <FolderGit2 size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{project.name}</span>
                                                        <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{project.description}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {activeProject === project.name ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">v{project.version || '0.1.0'}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Just now'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8"
                                                        onClick={() => handleActivate(project.name)}
                                                        disabled={activeProject === project.name}
                                                        title="Activate"
                                                    >
                                                        <Power size={14} className={activeProject === project.name ? "text-green-500" : ""} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(project)}>
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.name)}>
                                                        <Trash2 size={14} />
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
                            Configure the project details. Projects isolate files, memory, and settings for your agent instance.
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
                            {editingProject ? (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    Project name cannot be changed once created.
                                </p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground">
                                    Use lowercase, hyphens, or underscores.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <textarea 
                                id="desc"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Describe the purpose of this project..."
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
