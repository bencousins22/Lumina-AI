
import React, { useEffect, useState } from 'react';
import { agentService } from '../../services/agentService';
import { Info, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface Banner {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    dismissible: boolean;
}

export const LuminaBanner: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await agentService.getBanners();
                setBanners(data || []);
            } catch (e) {
                // Silently fail - banners endpoint may not exist on all backends
                setBanners([]);
            }
        };
        fetchBanners();
        const interval = setInterval(fetchBanners, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const dismissBanner = (id: string) => {
        setBanners(prev => prev.filter(b => b.id !== id));
    };

    if (banners.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 w-full bg-background relative z-50 border-b border-border/40">
            {banners.map((banner) => (
                <div 
                    key={banner.id}
                    className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm animate-in slide-in-from-top duration-300",
                        banner.type === 'info' && "bg-blue-500/10 text-blue-500",
                        banner.type === 'warning' && "bg-orange-500/10 text-orange-500",
                        banner.type === 'error' && "bg-destructive/10 text-destructive",
                        banner.type === 'success' && "bg-emerald-500/10 text-emerald-500"
                    )}
                >
                    {banner.type === 'info' && <Info size={16} />}
                    {banner.type === 'warning' && <AlertTriangle size={16} />}
                    {banner.type === 'error' && <AlertCircle size={16} />}
                    
                    <span className="flex-1 font-medium">{banner.message}</span>
                    
                    {banner.dismissible && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => dismissBanner(banner.id)}
                            className="h-6 w-6 hover:bg-black/5"
                        >
                            <X size={14} />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};
