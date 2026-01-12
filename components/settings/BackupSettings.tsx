import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Database, Download, Upload } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { agentService } from '../../services/agentService';

interface BackupSettingsProps {
  settings: any;
}

export const BackupSettings: React.FC<BackupSettingsProps> = ({ settings }) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      // This would open a modal in the original - for now we'll just trigger the API
      toast({
        title: 'Creating backup...',
        description: 'This feature will be expanded with a full backup modal',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create backup',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Backup & Restore</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create backups of your agent state, conversations, and memory. Restore from previous backups.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create Backup'}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Restore from Backup
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Backup Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Backups include all agent conversations and memory</li>
              <li>• Settings and configurations are preserved</li>
              <li>• You can restore to any previous state</li>
              <li>• Backups are stored locally</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
