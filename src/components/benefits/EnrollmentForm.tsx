import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';
import { useBenefitPlans, type BenefitPlan, type CoverageLevel } from '@/hooks/useBenefitPlans';
import { BenefitTypeBadge } from './BenefitTypeBadge';

interface EnrollmentFormProps {
  onSubmit: (data: {
    employeeId: string;
    planId: string;
    coverageLevelId: string;
    coverageLevel: CoverageLevel;
    startDate: Date;
  }) => void;
  onCancel: () => void;
}

export const EnrollmentForm = ({ onSubmit, onCancel }: EnrollmentFormProps) => {
  const [employeeId, setEmployeeId] = useState('');
  const [planId, setPlanId] = useState('');
  const [coverageLevelId, setCoverageLevelId] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [acknowledged, setAcknowledged] = useState(false);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: plans = [], isLoading: plansLoading } = useBenefitPlans('active');

  const activeEmployees = employees.filter(e => e.status === 'active');
  const selectedPlan = plans.find(p => p.id === planId);
  const selectedCoverage = selectedPlan?.coverage_levels?.find(c => c.id === coverageLevelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId && planId && coverageLevelId && startDate && selectedCoverage) {
      onSubmit({ 
        employeeId, 
        planId, 
        coverageLevelId, 
        coverageLevel: selectedCoverage,
        startDate 
      });
    }
  };

  const isValid = employeeId && planId && coverageLevelId && startDate && acknowledged;
  const isLoading = employeesLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Enrollment Details</CardTitle>
          <CardDescription>Select the employee and benefit plan for enrollment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} - {employee.department || 'No department'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Benefit Plan</Label>
            <Select value={planId} onValueChange={(v) => { setPlanId(v); setCoverageLevelId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select benefit plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <BenefitTypeBadge type={plan.type} showIcon={false} />
                      {plan.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {plans.length === 0 && (
              <p className="text-xs text-amber-600">No active benefit plans available.</p>
            )}
          </div>

          {selectedPlan && selectedPlan.coverage_levels && selectedPlan.coverage_levels.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Level</Label>
              <Select value={coverageLevelId} onValueChange={setCoverageLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coverage level" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPlan.coverage_levels.map((coverage) => (
                    <SelectItem key={coverage.id} value={coverage.id}>
                      {coverage.name} - ${coverage.employee_cost}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {selectedPlan && selectedCoverage && (
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Enrollment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage</span>
                <span>{selectedCoverage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee Cost</span>
                <span className="font-medium">${selectedCoverage.employee_cost}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employer Contribution</span>
                <span className="text-emerald-600">${selectedCoverage.employer_cost}/month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-3">
        <Checkbox
          id="acknowledge"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
        />
        <Label htmlFor="acknowledge" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I acknowledge that by enrolling in this benefit plan, the monthly premium will be deducted from my paycheck. I have reviewed the plan details and understand the coverage provided.
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid} className="flex-1">
          <Check className="mr-2 h-4 w-4" />
          Enroll
        </Button>
      </div>
    </form>
  );
};
