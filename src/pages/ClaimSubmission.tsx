import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Upload, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';
import { useBenefitEnrollments } from '@/hooks/useBenefitEnrollments';
import { useCreateBenefitClaim as useCreateClaim } from '@/hooks/useBenefitClaims';
import { BenefitTypeBadge } from '@/components/benefits';
import { useToast } from '@/hooks/use-toast';

const claimTypes = [
  'Medical Visit',
  'Specialist Visit',
  'Emergency Room',
  'Lab Work',
  'Prescription',
  'Dental Procedure',
  'Dental Cleaning',
  'Eye Exam',
  'Glasses/Contacts',
  'Other'
];

const ClaimSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [employeeId, setEmployeeId] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [claimType, setClaimType] = useState('');
  const [amount, setAmount] = useState('');
  const [dateOfService, setDateOfService] = useState<Date>();
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: allEnrollments = [], isLoading: enrollmentsLoading } = useBenefitEnrollments();
  const createClaim = useCreateClaim();

  const activeEmployees = employees.filter(e => e.status === 'active');
  
  // Get enrollments for selected employee
  const employeeEnrollments = allEnrollments.filter(
    e => e.employee_id === employeeId && e.status === 'active'
  );

  const selectedEnrollment = allEnrollments.find(e => e.id === enrollmentId);

  // Get currency symbol from selected plan
  const selectedPlanCurrency = selectedEnrollment?.plan?.currency || 'USD';
  const currencySymbol = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedPlanCurrency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0).find(p => p.type === 'currency')?.value || '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !enrollmentId || !claimType || !amount || !dateOfService || !provider || !selectedEnrollment) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createClaim.mutateAsync({
        employee_id: employeeId,
        plan_id: selectedEnrollment.plan_id,
        enrollment_id: enrollmentId,
        service_date: format(dateOfService, 'yyyy-MM-dd'),
        amount: parseFloat(amount),
        description: `${claimType}: ${description}`,
        provider_name: provider,
      });

      toast({
        title: 'Claim Submitted',
        description: 'Your claim has been submitted for processing.'
      });
      navigate('/benefits');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit claim. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isValid = employeeId && enrollmentId && claimType && amount && dateOfService && provider;
  const isLoading = employeesLoading || enrollmentsLoading;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>

        <PageHeader
          title="Submit Claim"
          subtitle="Submit a new benefits claim for processing"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Claim Details</CardTitle>
                <CardDescription>Provide information about your claim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); setEnrollmentId(''); }}>
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
                  <Label htmlFor="plan">Benefit Plan *</Label>
                  <Select value={enrollmentId} onValueChange={setEnrollmentId} disabled={!employeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder={employeeId ? "Select benefit plan" : "Select employee first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeEnrollments.map((enrollment) => (
                        <SelectItem key={enrollment.id} value={enrollment.id}>
                          <div className="flex items-center gap-2">
                            {enrollment.plan?.type && (
                              <BenefitTypeBadge type={enrollment.plan.type as any} showIcon={false} />
                            )}
                            {enrollment.plan?.name || 'Unknown plan'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {employeeId && employeeEnrollments.length === 0 && (
                    <p className="text-xs text-amber-600">This employee has no active benefit enrollments.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimType">Claim Type *</Label>
                    <Select value={claimType} onValueChange={setClaimType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select claim type" />
                      </SelectTrigger>
                      <SelectContent>
                        {claimTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Claim Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Service *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateOfService && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfService ? format(dateOfService, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfService}
                          onSelect={setDateOfService}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider Name *</Label>
                    <Input
                      id="provider"
                      placeholder="e.g., Bay Area Medical Center"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional details about the claim..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/benefits')} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || createClaim.isPending} className="flex-1">
                {createClaim.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Claim
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClaimSubmission;
