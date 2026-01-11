
import React, { useState, useEffect } from 'react';
import { CalendarClock, Play, Trash2, Plus, Zap, Loader2, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter, DialogClose 
} from '../ui/dialog';
import { 
    Table, TableBody, TableCell, TableHead, 
    TableHeader, TableRow 
} from '../ui/table';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { agentService, SchedulerTask } from '../../services/agentService';
import { cn } from '../../lib/utils';

export const AgentScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCron, setNewTaskCron] = useState('* * * * *');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await agentService.getTasks();
      setTasks(data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreate = async () => {
    if(!newTaskName) return;
    setActionLoading('create');
    try {
        await agentService.createTask({ name: newTaskName, cron: newTaskCron, active: true });
        setNewTaskName('');
        setNewTaskCron('* * * * *');
        setIsDialogOpen(false);
        await loadTasks();
    } finally {
        setActionLoading(null);
    }
  };

  const toggleTask = async (task: SchedulerTask) => {
    setActionLoading(task.id);
    try {
        await agentService.updateTask(task.id, { active: !task.active });
        await loadTasks();
    } finally {
        setActionLoading(null);
    }
  };

  const deleteTask = async (taskId: string) => {
      if(!confirm("Are you sure you want to delete this task?")) return;
      setActionLoading(taskId);
      try {
          await agentService.deleteTask(taskId);
          await loadTasks();
      } finally {
          setActionLoading(null);
      }
  };

  const runTask = async (taskId: string) => {
      setActionLoading(taskId);
      try {
          await agentService.runTask(taskId);
          await loadTasks();
      } finally {
          setActionLoading(null);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
       <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Scheduler</h2>
            <p className="text-muted-foreground">Automate agent workflows with cron jobs.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus size={16} className="mr-2" /> New Task
        </Button>
      </div>

      <div className="flex-1 overflow-hidden bg-card rounded-xl border shadow-sm flex flex-col">
        <div className="flex-1 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Task Name</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-64 text-center">
                                <Empty className="border-0">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon"><CalendarClock /></EmptyMedia>
                                        <EmptyTitle>No Scheduled Tasks</EmptyTitle>
                                        <EmptyDescription>
                                            Create automated tasks to run background agents at specific intervals.
                                        </EmptyDescription>
                                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="mt-4">
                                            Create First Task
                                        </Button>
                                    </EmptyHeader>
                                </Empty>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", task.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                            <CalendarClock size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{task.name}</span>
                                            {task.state === 'RUNNING' && (
                                                <span className="text-[10px] text-amber-500 font-medium animate-pulse flex items-center gap-1">
                                                    <Loader2 size={8} className="animate-spin" /> Running Now
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-2 py-1 rounded border font-mono text-foreground">{task.cron}</code>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs font-mono">
                                    {task.next_run || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch 
                                            checked={task.active} 
                                            onCheckedChange={() => toggleTask(task)} 
                                            disabled={!!actionLoading}
                                        />
                                        <Badge variant={task.active ? "success" : "secondary"}>
                                            {task.active ? "Active" : "Paused"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => runTask(task.id)}
                                            disabled={!!actionLoading}
                                            className="h-8"
                                            title="Run Now"
                                        >
                                            <Zap size={14} className={cn("mr-1", actionLoading === task.id ? "animate-spin" : "fill-current")} />
                                            Run
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteTask(task.id)}
                                            disabled={!!actionLoading}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md w-[90vw] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Create Scheduled Task</DialogTitle>
                  <DialogDescription>
                      Define a name and cron schedule for your agent task.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="task-name">Task Name</Label>
                      <Input 
                        id="task-name" 
                        placeholder="e.g. Daily Summarization" 
                        value={newTaskName} 
                        onChange={e => setNewTaskName(e.target.value)} 
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="cron">Cron Schedule</Label>
                      <div className="flex gap-2">
                          <Input 
                            id="cron" 
                            placeholder="* * * * *" 
                            value={newTaskCron} 
                            onChange={e => setNewTaskCron(e.target.value)} 
                            className="font-mono"
                          />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                          Format: minute hour day(month) month day(week)
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setNewTaskCron('0 9 * * *')}>Daily 9am</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setNewTaskCron('0 0 * * 0')}>Weekly</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setNewTaskCron('*/15 * * * *')}>Every 15m</Badge>
                      </div>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={actionLoading === 'create'}>
                      {actionLoading === 'create' && <Loader2 size={14} className="animate-spin mr-2"/>}
                      Create Task
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};
