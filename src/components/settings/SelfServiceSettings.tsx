import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface SelfServiceSettingsProps {
  employeeCanViewCompensation: boolean;
  showCompensationLineItems: boolean;
  onChange: (field: 'employeeCanViewCompensation' | 'showCompensationLineItems', value: boolean) => void;
}

export function SelfServiceSettings({
  employeeCanViewCompensation,
  showCompensationLineItems,
  onChange,
}: SelfServiceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Employee Self-Service</CardTitle>
            <CardDescription>
              Control what employees can see on their My Profile page
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="compensation-visibility" className="font-medium">
              Employees can view compensation breakdown
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow employees to see their salary details on their profile
            </p>
          </div>
          <Switch
            id="compensation-visibility"
            checked={employeeCanViewCompensation}
            onCheckedChange={(checked) => onChange('employeeCanViewCompensation', checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label 
              htmlFor="line-items-visibility" 
              className={`font-medium ${!employeeCanViewCompensation ? 'text-muted-foreground' : ''}`}
            >
              Show allowance/deduction line items
            </Label>
            <p className="text-sm text-muted-foreground">
              Show individual items instead of just totals
            </p>
          </div>
          <Switch
            id="line-items-visibility"
            checked={showCompensationLineItems}
            onCheckedChange={(checked) => onChange('showCompensationLineItems', checked)}
            disabled={!employeeCanViewCompensation}
          />
        </div>
      </CardContent>
    </Card>
  );
}
