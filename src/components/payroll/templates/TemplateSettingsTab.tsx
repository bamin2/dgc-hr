import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PayslipTemplateSettings } from "@/types/payslip-template";

interface TemplateSettingsTabProps {
  settings: PayslipTemplateSettings;
  onSettingsChange: (settings: PayslipTemplateSettings) => void;
}

export function TemplateSettingsTab({ settings, onSettingsChange }: TemplateSettingsTabProps) {
  const updateBranding = <K extends keyof PayslipTemplateSettings['branding']>(
    key: K, 
    value: PayslipTemplateSettings['branding'][K]
  ) => {
    onSettingsChange({
      ...settings,
      branding: { ...settings.branding, [key]: value },
    });
  };

  const updateLayout = <K extends keyof PayslipTemplateSettings['layout']>(
    key: K, 
    value: PayslipTemplateSettings['layout'][K]
  ) => {
    onSettingsChange({
      ...settings,
      layout: { ...settings.layout, [key]: value },
    });
  };

  const updateVisibility = (key: keyof PayslipTemplateSettings['visibility'], value: boolean) => {
    onSettingsChange({
      ...settings,
      visibility: { ...settings.visibility, [key]: value },
    });
  };

  const updateBreakdown = <K extends keyof PayslipTemplateSettings['breakdown']>(
    key: K, 
    value: PayslipTemplateSettings['breakdown'][K]
  ) => {
    onSettingsChange({
      ...settings,
      breakdown: { ...settings.breakdown, [key]: value },
    });
  };

  const updateCurrency = (
    key: keyof PayslipTemplateSettings['currency'], 
    value: 'employee_currency' | 'location_currency'
  ) => {
    onSettingsChange({
      ...settings,
      currency: { ...settings.currency, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Branding Section */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Configure company branding on payslips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Company Logo</Label>
              <p className="text-sm text-muted-foreground">Display company logo on payslip header</p>
            </div>
            <Switch
              checked={settings.branding.show_logo}
              onCheckedChange={(checked) => updateBranding('show_logo', checked)}
            />
          </div>

          {settings.branding.show_logo && (
            <div className="space-y-2">
              <Label>Logo Alignment</Label>
              <Select
                value={settings.branding.logo_alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => updateBranding('logo_alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Company Address</Label>
              <p className="text-sm text-muted-foreground">Display company address in header</p>
            </div>
            <Switch
              checked={settings.branding.show_company_address}
              onCheckedChange={(checked) => updateBranding('show_company_address', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Generated Timestamp</Label>
              <p className="text-sm text-muted-foreground">Display when the payslip was generated</p>
            </div>
            <Switch
              checked={settings.branding.show_generated_timestamp}
              onCheckedChange={(checked) => updateBranding('show_generated_timestamp', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Footer Disclaimer Text</Label>
            <Textarea
              value={settings.branding.footer_disclaimer_text}
              onChange={(e) => updateBranding('footer_disclaimer_text', e.target.value)}
              placeholder="Enter footer disclaimer text..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Configure page layout and formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <Select
              value={settings.layout.paper_size}
              onValueChange={(value: 'A4' | 'Letter') => updateLayout('paper_size', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Top Margin (mm)</Label>
              <Input
                type="number"
                value={settings.layout.margin_top}
                onChange={(e) => updateLayout('margin_top', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Bottom Margin (mm)</Label>
              <Input
                type="number"
                value={settings.layout.margin_bottom}
                onChange={(e) => updateLayout('margin_bottom', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Left Margin (mm)</Label>
              <Input
                type="number"
                value={settings.layout.margin_left}
                onChange={(e) => updateLayout('margin_left', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Right Margin (mm)</Label>
              <Input
                type="number"
                value={settings.layout.margin_right}
                onChange={(e) => updateLayout('margin_right', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Decimal Places</Label>
            <Input
              type="number"
              value={settings.layout.decimals}
              onChange={(e) => updateLayout('decimals', parseInt(e.target.value) || 2)}
              min={0}
              max={4}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visibility Section */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Choose what information to display on payslips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Employee ID</Label>
              <p className="text-sm text-muted-foreground">Display employee code on payslip</p>
            </div>
            <Switch
              checked={settings.visibility.show_employee_id}
              onCheckedChange={(checked) => updateVisibility('show_employee_id', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Department</Label>
              <p className="text-sm text-muted-foreground">Display employee's department</p>
            </div>
            <Switch
              checked={settings.visibility.show_department}
              onCheckedChange={(checked) => updateVisibility('show_department', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Job Title</Label>
              <p className="text-sm text-muted-foreground">Display employee's position/job title</p>
            </div>
            <Switch
              checked={settings.visibility.show_job_title}
              onCheckedChange={(checked) => updateVisibility('show_job_title', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Pay Period</Label>
              <p className="text-sm text-muted-foreground">Display the pay period dates</p>
            </div>
            <Switch
              checked={settings.visibility.show_pay_period}
              onCheckedChange={(checked) => updateVisibility('show_pay_period', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Earnings/Deductions Breakdown Section */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings & Deductions Breakdown</CardTitle>
          <CardDescription>Configure how earnings and deductions are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Earnings Breakdown</Label>
            <Select
              value={settings.breakdown.earnings_breakdown}
              onValueChange={(value: 'summary' | 'detailed') => updateBreakdown('earnings_breakdown', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary (Total allowances only)</SelectItem>
                <SelectItem value="detailed">Detailed (List each allowance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deductions Breakdown</Label>
            <Select
              value={settings.breakdown.deductions_breakdown}
              onValueChange={(value: 'summary' | 'detailed') => updateBreakdown('deductions_breakdown', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary (Total deductions only)</SelectItem>
                <SelectItem value="detailed">Detailed (List each deduction)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include GOSI Line</Label>
              <p className="text-sm text-muted-foreground">Show GOSI contribution as separate line item</p>
            </div>
            <Switch
              checked={settings.breakdown.include_gosi_line}
              onCheckedChange={(checked) => updateBreakdown('include_gosi_line', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Section */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>Configure currency display on payslips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payslip Currency Mode</Label>
            <Select
              value={settings.currency.payslip_currency_mode}
              onValueChange={(value: 'employee_currency' | 'location_currency') => updateCurrency('payslip_currency_mode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee_currency">Employee Currency</SelectItem>
                <SelectItem value="location_currency">Work Location Currency</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {settings.currency.payslip_currency_mode === 'employee_currency'
                ? "Payslip will display amounts in the employee's salary currency"
                : "Payslip will display amounts in the work location's default currency"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
