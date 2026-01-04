import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Upload, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockEmployees } from '@/data/employees';
import { benefitEnrollments } from '@/data/benefits';
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
  const [planId, setPlanId] = useState('');
  const [claimType, setClaimType] = useState('');
  const [amount, setAmount] = useState('');
  const [dateOfService, setDateOfService] = useState<Date>();
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');

  // Get enrollments for selected employee
  const employeeEnrollments = benefitEnrollments.filter(
    e => e.employeeId === employeeId && e.status === 'active'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !planId || !claimType || !amount || !dateOfService || !provider) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // In a real app, this would submit to an API
    console.log('Claim submitted:', {
      employeeId,
      planId,
      claimType,
      amount: parseFloat(amount),
      dateOfService,
      provider,
      description
    });

    toast({
      title: 'Claim Submitted',
      description: 'Your claim has been submitted for processing.'
    });
    navigate('/benefits');
  };

  const isValid = employeeId && planId && claimType && amount && dateOfService && provider;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Benefits
          </Button>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Submit Claim</h1>
            <p className="text-muted-foreground">Submit a new benefits claim for processing</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Claim Details</CardTitle>
                <CardDescription>Provide information about your claim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); setPlanId(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.filter(e => e.status === 'active').map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Benefit Plan *</Label>
                  <Select value={planId} onValueChange={setPlanId} disabled={!employeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder={employeeId ? "Select benefit plan" : "Select employee first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeEnrollments.map((enrollment) => (
                        <SelectItem key={enrollment.planId} value={enrollment.planId}>
                          <div className="flex items-center gap-2">
                            <BenefitTypeBadge type={enrollment.plan.type} showIcon={false} />
                            {enrollment.plan.name}
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
              <Button type="submit" disabled={!isValid} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Submit Claim
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ClaimSubmission;
