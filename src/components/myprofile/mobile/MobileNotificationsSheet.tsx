import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from 'sonner';
import { Loader2, Mail, Bell, Moon } from 'lucide-react';

interface MobileNotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNotificationsSheet({
  open,
  onOpenChange,
}: MobileNotificationsSheetProps) {
  const { settings, isLoading, updateSettings, isSaving } = useNotificationPreferences();
  
  // Local state for toggles
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  
  // Sync with fetched settings
  useEffect(() => {
    if (settings) {
      // Email is "enabled" if most email settings are on
      const emailToggles = Object.values(settings.email);
      setEmailEnabled(emailToggles.filter(Boolean).length > emailToggles.length / 2);
      setPushEnabled(settings.push.enabled);
      setQuietHoursEnabled(settings.schedule.quietHoursEnabled);
    }
  }, [settings]);
  
  const hasChanges = 
    emailEnabled !== (Object.values(settings?.email || {}).filter(Boolean).length > Object.values(settings?.email || {}).length / 2) ||
    pushEnabled !== settings?.push?.enabled ||
    quietHoursEnabled !== settings?.schedule?.quietHoursEnabled;

  const handleSave = async () => {
    try {
      await updateSettings({
        email: {
          newEmployee: emailEnabled,
          leaveSubmissions: emailEnabled,
          leaveApprovals: emailEnabled,
          payrollReminders: emailEnabled,
          documentExpiration: emailEnabled,
          systemAnnouncements: emailEnabled,
          weeklySummary: false,
        },
        push: {
          ...settings.push,
          enabled: pushEnabled,
        },
        schedule: {
          ...settings.schedule,
          quietHoursEnabled: quietHoursEnabled,
        },
      });
      toast.success('Notification preferences saved');
      onOpenChange(false);
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pr-12">
          <DrawerTitle>Notification Preferences</DrawerTitle>
        </DrawerHeader>
        
        <DrawerBody>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="email-toggle" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-toggle"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>
              </div>
              
              {/* Push Notifications */}
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="push-toggle" className="font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get instant alerts on your device
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-toggle"
                    checked={pushEnabled}
                    onCheckedChange={setPushEnabled}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Quiet Hours */}
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="quiet-toggle" className="font-medium">
                        Quiet Hours
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Pause notifications 10 PM - 7 AM
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="quiet-toggle"
                    checked={quietHoursEnabled}
                    onCheckedChange={setQuietHoursEnabled}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center px-4">
                For detailed notification settings, visit Settings on desktop.
              </p>
            </div>
          )}
        </DrawerBody>
        
        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full h-12"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
