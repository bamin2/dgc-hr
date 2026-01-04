import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SettingsCard } from './SettingsCard';
import { Mail, Bell, Clock } from 'lucide-react';
import { NotificationSettings } from '@/data/settings';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
}

interface ToggleItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleItem = ({ id, label, description, checked, onChange }: ToggleItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <div className="space-y-0.5">
      <Label htmlFor={id} className="font-normal">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </div>
);

export const NotificationSettingsForm = ({ settings, onChange }: NotificationSettingsFormProps) => {
  const updateEmail = (field: keyof NotificationSettings['email'], value: boolean) => {
    onChange({ 
      ...settings, 
      email: { ...settings.email, [field]: value } 
    });
  };

  const updatePush = (field: keyof NotificationSettings['push'], value: boolean) => {
    onChange({ 
      ...settings, 
      push: { ...settings.push, [field]: value } 
    });
  };

  const updateSchedule = (field: keyof NotificationSettings['schedule'], value: boolean | string) => {
    onChange({ 
      ...settings, 
      schedule: { ...settings.schedule, [field]: value } 
    });
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Email Notifications" 
        description="Configure which emails you receive"
        icon={Mail}
      >
        <div className="divide-y divide-border/50">
          <ToggleItem
            id="newEmployee"
            label="New Employee Onboarding"
            description="Notifications when new employees join"
            checked={settings.email.newEmployee}
            onChange={(v) => updateEmail('newEmployee', v)}
          />
          <ToggleItem
            id="leaveSubmissions"
            label="Leave Request Submissions"
            description="When employees submit leave requests"
            checked={settings.email.leaveSubmissions}
            onChange={(v) => updateEmail('leaveSubmissions', v)}
          />
          <ToggleItem
            id="leaveApprovals"
            label="Leave Request Approvals"
            description="Updates on leave request status"
            checked={settings.email.leaveApprovals}
            onChange={(v) => updateEmail('leaveApprovals', v)}
          />
          <ToggleItem
            id="payrollReminders"
            label="Payroll Processing Reminders"
            description="Reminders before payroll deadlines"
            checked={settings.email.payrollReminders}
            onChange={(v) => updateEmail('payrollReminders', v)}
          />
          <ToggleItem
            id="documentExpiration"
            label="Document Expiration Alerts"
            description="When employee documents are expiring"
            checked={settings.email.documentExpiration}
            onChange={(v) => updateEmail('documentExpiration', v)}
          />
          <ToggleItem
            id="systemAnnouncements"
            label="System Announcements"
            description="Important updates and changes"
            checked={settings.email.systemAnnouncements}
            onChange={(v) => updateEmail('systemAnnouncements', v)}
          />
          <ToggleItem
            id="weeklySummary"
            label="Weekly Summary Reports"
            description="Weekly overview of HR activities"
            checked={settings.email.weeklySummary}
            onChange={(v) => updateEmail('weeklySummary', v)}
          />
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Push Notifications" 
        description="Real-time alerts in your browser"
        icon={Bell}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="pushEnabled" className="font-medium">Enable Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Master toggle for all push notifications</p>
            </div>
            <Switch 
              id="pushEnabled" 
              checked={settings.push.enabled} 
              onCheckedChange={(v) => updatePush('enabled', v)} 
            />
          </div>
          {settings.push.enabled && (
            <div className="divide-y divide-border/50">
              <ToggleItem
                id="newLeaveRequests"
                label="New Leave Requests"
                checked={settings.push.newLeaveRequests}
                onChange={(v) => updatePush('newLeaveRequests', v)}
              />
              <ToggleItem
                id="urgentApprovals"
                label="Urgent Approvals Needed"
                checked={settings.push.urgentApprovals}
                onChange={(v) => updatePush('urgentApprovals', v)}
              />
              <ToggleItem
                id="payrollDeadlines"
                label="Payroll Deadlines"
                checked={settings.push.payrollDeadlines}
                onChange={(v) => updatePush('payrollDeadlines', v)}
              />
              <ToggleItem
                id="systemUpdates"
                label="System Updates"
                checked={settings.push.systemUpdates}
                onChange={(v) => updatePush('systemUpdates', v)}
              />
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Notification Schedule" 
        description="Control when you receive notifications"
        icon={Clock}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="quietHours" className="font-medium">Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">Pause notifications during set hours</p>
            </div>
            <Switch 
              id="quietHours" 
              checked={settings.schedule.quietHoursEnabled} 
              onCheckedChange={(v) => updateSchedule('quietHoursEnabled', v)} 
            />
          </div>
          {settings.schedule.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quietStart">Start Time</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={settings.schedule.quietHoursStart}
                  onChange={(e) => updateSchedule('quietHoursStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietEnd">End Time</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={settings.schedule.quietHoursEnd}
                  onChange={(e) => updateSchedule('quietHoursEnd', e.target.value)}
                />
              </div>
            </div>
          )}
          <ToggleItem
            id="weekendNotifications"
            label="Weekend Notifications"
            description="Receive notifications on weekends"
            checked={settings.schedule.weekendNotifications}
            onChange={(v) => updateSchedule('weekendNotifications', v)}
          />
        </div>
      </SettingsCard>
    </div>
  );
};
