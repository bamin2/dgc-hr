import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SettingsCard } from './SettingsCard';
import { ImageUpload } from './ImageUpload';
import { User, Monitor, Globe } from 'lucide-react';
import { 
  UserPreferences, 
  languages, 
  timezones, 
  dateFormats,
  defaultPages 
} from '@/data/settings';

interface UserPreferencesFormProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
  jobTitleFromEmployee?: boolean;
}

export const UserPreferencesForm = ({ preferences, onChange, jobTitleFromEmployee = false }: UserPreferencesFormProps) => {
  const updateProfile = (field: string, value: string) => {
    onChange({ 
      ...preferences, 
      profile: { ...preferences.profile, [field]: value } 
    });
  };

  const updateDisplay = (field: string, value: string | number | boolean) => {
    onChange({ 
      ...preferences, 
      display: { ...preferences.display, [field]: value } 
    });
  };

  const updateRegional = (field: string, value: string) => {
    onChange({ 
      ...preferences, 
      regional: { ...preferences.regional, [field]: value } 
    });
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Profile Settings" 
        description="Your personal information"
        icon={User}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={preferences.profile.avatar}
              onChange={(v) => updateProfile('avatar', v)}
              label="Upload Photo"
              fallback={`${preferences.profile.firstName[0] || ''}${preferences.profile.lastName[0] || ''}`}
              size="md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={preferences.profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={preferences.profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Address</Label>
              <Input
                id="userEmail"
                type="email"
                value={preferences.profile.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPhone">Phone Number</Label>
              <Input
                id="userPhone"
                value={preferences.profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={preferences.profile.jobTitle}
                disabled={jobTitleFromEmployee}
                className={jobTitleFromEmployee ? 'bg-muted' : ''}
                onChange={(e) => !jobTitleFromEmployee && updateProfile('jobTitle', e.target.value)}
              />
              {jobTitleFromEmployee && (
                <p className="text-xs text-muted-foreground">
                  Managed in Employee Management
                </p>
              )}
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Display Preferences" 
        description="Customize your interface experience"
        icon={Monitor}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={preferences.display.language} 
                onValueChange={(v) => updateDisplay('language', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPage">Default Landing Page</Label>
              <Select 
                value={preferences.display.defaultPage} 
                onValueChange={(v) => updateDisplay('defaultPage', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {defaultPages.map((page) => (
                    <SelectItem key={page.value} value={page.value}>{page.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Select 
                value={preferences.display.itemsPerPage.toString()} 
                onValueChange={(v) => updateDisplay('itemsPerPage', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((count) => (
                    <SelectItem key={count} value={count.toString()}>{count} items</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="compactMode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing for denser layouts</p>
              </div>
              <Switch
                id="compactMode"
                checked={preferences.display.compactMode}
                onCheckedChange={(v) => updateDisplay('compactMode', v)}
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Regional Settings" 
        description="Location and format preferences"
        icon={Globe}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userTimezone">Timezone</Label>
              <Select 
                value={preferences.regional.timezone} 
                onValueChange={(v) => updateRegional('timezone', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userDateFormat">Date Format</Label>
              <Select 
                value={preferences.regional.dateFormat} 
                onValueChange={(v) => updateRegional('dateFormat', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select 
                value={preferences.regional.timeFormat} 
                onValueChange={(v) => updateRegional('timeFormat', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Week Starts On</Label>
              <Select 
                value={preferences.regional.firstDayOfWeek} 
                onValueChange={(v) => updateRegional('firstDayOfWeek', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
