import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsCard } from './SettingsCard';
import { LogoUpload } from './LogoUpload';
import { LogoPreviewSection } from './LogoPreviewSection';
import { IconPicker } from './IconPicker';
import { Building2, Phone, Palette, Calendar } from 'lucide-react';
import { CountrySelect } from '@/components/ui/country-select';
import { CurrencySelect } from '@/components/ui/currency-select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CompanySettings, 
  industries, 
  companySizes, 
  timezones, 
  dateFormats 
} from '@/data/settings';

const weekDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface CompanyProfileFormProps {
  settings: CompanySettings;
  onChange: (settings: CompanySettings) => void;
}

export const CompanyProfileForm = ({ settings, onChange }: CompanyProfileFormProps) => {
  const updateField = (field: string, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  const updateAddress = (field: string, value: string) => {
    onChange({ 
      ...settings, 
      address: { ...settings.address, [field]: value } 
    });
  };

  const updateBranding = (field: string, value: string | number[]) => {
    onChange({ 
      ...settings, 
      branding: { ...settings.branding, [field]: value } 
    });
  };

  const toggleWeekendDay = (day: number) => {
    const currentDays = settings.branding.weekendDays || [5, 6];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    updateBranding('weekendDays', newDays);
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Company Information" 
        description="Basic details about your organization"
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={settings.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={settings.legalName}
              onChange={(e) => updateField('legalName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={settings.industry} onValueChange={(v) => updateField('industry', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Select value={settings.companySize} onValueChange={(v) => updateField('companySize', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>{size} employees</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <Input
              id="taxId"
              value={settings.taxId}
              onChange={(e) => updateField('taxId', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearFounded">Year Founded</Label>
            <Input
              id="yearFounded"
              value={settings.yearFounded}
              onChange={(e) => updateField('yearFounded', e.target.value)}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Contact Information" 
        description="How to reach your company"
        icon={Phone}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Primary Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={settings.website}
              onChange={(e) => updateField('website', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={settings.address.street}
              onChange={(e) => updateAddress('street', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={settings.address.city}
              onChange={(e) => updateAddress('city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              value={settings.address.state}
              onChange={(e) => updateAddress('state', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP / Postal Code</Label>
            <Input
              id="zipCode"
              value={settings.address.zipCode}
              onChange={(e) => updateAddress('zipCode', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <CountrySelect
              value={settings.address.country}
              onValueChange={(v) => updateAddress('country', v)}
              placeholder="Select country"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Branding & Preferences" 
        description="Customize your workspace appearance"
        icon={Palette}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Sidebar Logo</Label>
              <p className="text-xs text-muted-foreground">Displayed in the navigation sidebar</p>
              <LogoUpload
                value={settings.branding.logoUrl}
                onChange={(v) => updateBranding('logoUrl', v)}
                label="Upload Sidebar Logo"
                fallback={settings.name.slice(0, 2).toUpperCase()}
                size="md"
              />
            </div>

            <div className="space-y-2">
              <Label>Document Logo</Label>
              <p className="text-xs text-muted-foreground">Used in generated documents and email templates</p>
              <LogoUpload
                value={settings.branding.documentLogoUrl}
                onChange={(v) => updateBranding('documentLogoUrl', v)}
                label="Upload Document Logo"
                fallback={settings.name.slice(0, 2).toUpperCase()}
                size="lg"
              />
            </div>
          </div>

          {/* Logo Preview Section */}
          <LogoPreviewSection
            sidebarLogoUrl={settings.branding.logoUrl}
            documentLogoUrl={settings.branding.documentLogoUrl}
            companyName={settings.name}
            displayType={settings.branding.dashboardDisplayType}
            iconName={settings.branding.dashboardIconName}
          />

          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label>Dashboard Display</Label>
              <p className="text-xs text-muted-foreground">What to show in the sidebar header</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="display-logo"
                  checked={settings.branding.dashboardDisplayType === 'logo'}
                  onCheckedChange={() => updateBranding('dashboardDisplayType', 'logo')}
                />
                <Label htmlFor="display-logo" className="text-sm font-normal cursor-pointer">
                  Use Company Logo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="display-icon"
                  checked={settings.branding.dashboardDisplayType === 'icon'}
                  onCheckedChange={() => updateBranding('dashboardDisplayType', 'icon')}
                />
                <Label htmlFor="display-icon" className="text-sm font-normal cursor-pointer">
                  Use Icon/Symbol
                </Label>
              </div>
            </div>
            {settings.branding.dashboardDisplayType === 'icon' && (
              <div className="pt-2">
                <IconPicker
                  value={settings.branding.dashboardIconName}
                  onChange={(iconName) => updateBranding('dashboardIconName', iconName)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.branding.primaryColor}
                  onChange={(e) => updateBranding('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.branding.primaryColor}
                  onChange={(e) => updateBranding('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.branding.timezone} onValueChange={(v) => updateBranding('timezone', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.branding.dateFormat} onValueChange={(v) => updateBranding('dateFormat', v)}>
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
              <Label htmlFor="currency">Currency</Label>
              <CurrencySelect
                value={settings.branding.currency}
                onValueChange={(v) => updateBranding('currency', v)}
                placeholder="Select currency"
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard 
        title="Work Schedule" 
        description="Configure your company's work week and payroll schedule"
        icon={Calendar}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Weekend Days</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select the days that are considered weekends for your company. Public holidays falling on these days will be compensated.
            </p>
            <div className="flex flex-wrap gap-3">
              {weekDays.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`weekend-${day.value}`}
                    checked={settings.branding.weekendDays?.includes(day.value)}
                    onCheckedChange={() => toggleWeekendDay(day.value)}
                  />
                  <Label
                    htmlFor={`weekend-${day.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payrollDay">Payroll Day of Month</Label>
              <p className="text-xs text-muted-foreground">
                The day each month when payroll is processed (1-31)
              </p>
              <Select 
                value={String(settings.payrollDayOfMonth || 25)} 
                onValueChange={(v) => onChange({ ...settings, payrollDayOfMonth: parseInt(v, 10) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
