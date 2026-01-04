import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SettingsCard } from './SettingsCard';
import { SessionCard } from './SessionCard';
import { Lock, Shield, Laptop, History } from 'lucide-react';
import { SecuritySession } from '@/data/settings';
import { toast } from 'sonner';

interface SecuritySettingsProps {
  sessions: SecuritySession[];
  onRevokeSession: (id: string) => void;
  onRevokeAllSessions: () => void;
}

export const SecuritySettings = ({ 
  sessions, 
  onRevokeSession, 
  onRevokeAllSessions 
}: SecuritySettingsProps) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = () => {
    toast.info('Password change dialog would open here');
  };

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast.success(enabled ? '2FA enabled' : '2FA disabled');
  };

  const handleExportAuditLog = () => {
    toast.success('Audit log exported');
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Password" 
        description="Manage your password settings"
        icon={Lock}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Current Password</p>
            <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
          </div>
          <Button onClick={handleChangePassword}>Change Password</Button>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Password Requirements</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Include at least one number</li>
            <li>• Include at least one special character</li>
          </ul>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Two-Factor Authentication" 
        description="Add an extra layer of security"
        icon={Shield}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="2fa" className="font-medium">Enable 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Require a verification code in addition to your password
            </p>
          </div>
          <Switch 
            id="2fa" 
            checked={twoFactorEnabled} 
            onCheckedChange={handleToggle2FA} 
          />
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 rounded-lg border border-border/50">
            <p className="text-sm font-medium mb-2">Recovery Codes</p>
            <p className="text-sm text-muted-foreground mb-3">
              Save these codes in a secure place. You can use them to access your account if you lose your 2FA device.
            </p>
            <Button variant="outline" size="sm">View Recovery Codes</Button>
          </div>
        )}
      </SettingsCard>

      <SettingsCard 
        title="Active Sessions" 
        description="Manage devices where you're logged in"
        icon={Laptop}
      >
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onRevoke={onRevokeSession}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRevokeAllSessions}
          >
            Sign Out All Other Devices
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Security Audit Log" 
        description="Review recent security events"
        icon={History}
      >
        <div className="space-y-3">
          {[
            { event: 'Successful login', time: '2 hours ago', location: 'San Francisco, CA' },
            { event: 'Password changed', time: '30 days ago', location: 'San Francisco, CA' },
            { event: 'New device added', time: '45 days ago', location: 'Oakland, CA' },
            { event: '2FA disabled', time: '60 days ago', location: 'San Francisco, CA' }
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{log.event}</p>
                <p className="text-xs text-muted-foreground">{log.location}</p>
              </div>
              <span className="text-sm text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={handleExportAuditLog}>
            Export Full Audit Log
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
};
