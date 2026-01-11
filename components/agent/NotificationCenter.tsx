
import React, { useEffect, useState } from 'react';
import { agentService } from '../../services/agentService';
import { Bell, Check, Trash2, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: string;
}

export const NotificationCenter: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await agentService.getNotifications();
            setNotifications(data || []);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        try {
            await agentService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    const clearAll = async () => {
        try {
            await agentService.clearNotifications();
            setNotifications([]);
        } catch (e) {
            console.error("Failed to clear notifications", e);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-border/50 flex-row items-center justify-between space-y-0">
                    <SheetTitle className="flex items-center gap-2">
                        <Bell size={18} className="text-primary" />
                        Notifications
                    </SheetTitle>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} className="mr-1" />
                            Clear All
                        </Button>
                    )}
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Bell size={24} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={cn(
                                        "p-4 border-b border-border/40 transition-colors hover:bg-muted/30 relative group",
                                        !n.read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full shrink-0 flex items-center justify-center",
                                            n.type === 'info' && "bg-blue-500/10 text-blue-500",
                                            n.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                                            n.type === 'warning' && "bg-orange-500/10 text-orange-500",
                                            n.type === 'error' && "bg-destructive/10 text-destructive"
                                        )}>
                                            {n.type === 'info' && <Info size={16} />}
                                            {n.type === 'success' && <CheckCircle2 size={16} />}
                                            {n.type === 'warning' && <AlertCircle size={16} />}
                                            {n.type === 'error' && <AlertCircle size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={cn("text-sm font-semibold truncate", !n.read && "text-foreground")}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {!n.read && (
                                        <button 
                                            onClick={() => markRead(n.id)}
                                            className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Mark as read"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
