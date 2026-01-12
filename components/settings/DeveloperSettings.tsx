import React from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Terminal } from 'lucide-react';

interface DeveloperSettingsProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
  additional?: any;
}

export const DeveloperSettings: React.FC<DeveloperSettingsProps> = ({ settings, updateSetting, additional }) => {
  const shellInterfaces = additional?.shell_interfaces || [
    { value: 'local', label: 'Local Python TTY' },
    { value: 'ssh', label: 'SSH' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Development Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Shell Interface</Label>
            <Select value={settings?.shell_interface || 'local'} onValueChange={(val) => updateSetting('shell_interface', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shell interface" />
              </SelectTrigger>
              <SelectContent>
                {shellInterfaces.map((iface: any) => (
                  <SelectItem key={iface.value} value={iface.value}>{iface.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Local Python TTY or SSH for remote execution</p>
          </div>

          {!additional?.is_dockerized && (
            <>
              <div className="space-y-2">
                <Label>RFC Destination URL</Label>
                <Input
                  value={settings?.rfc_destination_url || ''}
                  onChange={(e) => updateSetting('rfc_destination_url', e.target.value)}
                  placeholder="http://localhost"
                />
              </div>

              <div className="space-y-2">
                <Label>RFC HTTP Port</Label>
                <Input
                  type="number"
                  value={settings?.rfc_http_port || 50001}
                  onChange={(e) => updateSetting('rfc_http_port', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>RFC SSH Port</Label>
                <Input
                  type="number"
                  value={settings?.rfc_ssh_port || 2222}
                  onChange={(e) => updateSetting('rfc_ssh_port', parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>RFC Password</Label>
            <Input
              type="password"
              value={settings?.rfc_password || ''}
              onChange={(e) => updateSetting('rfc_password', e.target.value)}
              placeholder="Password for RFC connection"
              autoComplete="off"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
