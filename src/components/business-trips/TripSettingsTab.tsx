import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import { useBusinessTripSettings, useUpdateBusinessTripSettings } from '@/hooks/useBusinessTripSettings';
import { DestinationsManager } from './DestinationsManager';
import { toast } from '@/hooks/use-toast';

export function TripSettingsTab() {
  const { data: settings, isLoading } = useBusinessTripSettings();
  const updateSettings = useUpdateBusinessTripSettings();
  
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync local state when settings load
  if (settings && !localSettings) {
    setLocalSettings(settings);
  }

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    try {
      await updateSettings.mutateAsync(localSettings);
      toast({
        title: 'Settings saved',
        description: 'Business trip settings have been updated.',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Policy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Settings</CardTitle>
          <CardDescription>Configure business trip policies and rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Business Trips Module</Label>
              <p className="text-sm text-muted-foreground">
                Allow employees to create business trip requests
              </p>
            </div>
            <Switch
              checked={localSettings.module_enabled}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, module_enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="car-uplift">Car Uplift per Night (BHD)</Label>
              <Input
                id="car-uplift"
                type="number"
                step="0.001"
                value={localSettings.car_uplift_per_night_bhd}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    car_uplift_per_night_bhd: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Additional per diem for car travel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-nights">Max Nights Without Override</Label>
              <Input
                id="max-nights"
                type="number"
                value={localSettings.max_nights_without_override || ''}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    max_nights_without_override: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="No limit"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no limit
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Receipts</Label>
                <p className="text-sm text-muted-foreground">
                  Require employees to upload receipts
                </p>
              </div>
              <Switch
                checked={localSettings.require_receipts}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, require_receipts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Cancellation After Submit</Label>
                <p className="text-sm text-muted-foreground">
                  Allow employees to cancel trips after submission
                </p>
              </div>
              <Switch
                checked={localSettings.allow_cancellation_after_submit}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, allow_cancellation_after_submit: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Edit After Submit</Label>
                <p className="text-sm text-muted-foreground">
                  Allow employees to edit trips after submission
                </p>
              </div>
              <Switch
                checked={localSettings.allow_edit_after_submit}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, allow_edit_after_submit: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for trip events
                </p>
              </div>
              <Switch
                checked={localSettings.email_notifications_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, email_notifications_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the app notification center
                </p>
              </div>
              <Switch
                checked={localSettings.inapp_notifications_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, inapp_notifications_enabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Manager */}
      <DestinationsManager />
    </div>
  );
}
