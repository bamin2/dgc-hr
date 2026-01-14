import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Clock,
  Activity,
  Pencil,
  MessageSquare,
  UserX,
  Shield,
  KeyRound,
  RotateCcw,
  Banknote,
} from "lucide-react";
import { useEmployeeAllowances } from "@/hooks/useEmployeeAllowances";
import { useEmployeeDeductions } from "@/hooks/useEmployeeDeductions";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, EmployeeForm, RoleBadge, RoleSelectorWithDescription, CreateLoginDialog, ResetPasswordDialog, SalaryHistoryCard, BankDetailsDialog, EmployeeTimeOffTab, EmployeeActivityTab } from "@/components/employees";
import { EmployeeDocumentsTab } from "@/components/employees/documents";
import { EmployeeLoansTab } from "@/components/employees/EmployeeLoansTab";
import { useEmployee, useUpdateEmployee, useEmployees, Employee } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { getCountryByName, getCountryCodeByName } from "@/data/countries";
import { AppRole, roleDescriptions } from "@/data/roles";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatLongDate } from "@/lib/dateUtils";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right">{value || 'Not specified'}</span>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployeeRole, updateEmployeeRole, canManageRoles, canEditEmployees, isTeamMember } = useRole();
  const { profile } = useAuth();
  const { data: employee, isLoading, error } = useEmployee(id);
  const { data: allEmployees = [] } = useEmployees();
  const { data: allowances = [] } = useEmployeeAllowances(id);
  const { data: deductions = [] } = useEmployeeDeductions(id);
  const updateEmployee = useUpdateEmployee();
  const [formOpen, setFormOpen] = useState(false);
  const [createLoginOpen, setCreateLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const { data: workLocations } = useWorkLocations();
  const employeeRole = id ? getEmployeeRole(id) : 'employee';
  
  // Get HQ currency for formatting
  const hqLocation = workLocations?.find(loc => loc.is_hq);
  const currency = hqLocation?.currency || "USD";
  
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate allowance and deduction amounts
  const compensationBreakdown = useMemo(() => {
    const baseSalary = employee?.salary || 0;
    
    const allowanceItems = allowances.map((a: any) => {
      let amount = 0;
      if (a.custom_amount) {
        amount = a.custom_amount;
      } else if (a.allowance_template) {
        const template = a.allowance_template;
        if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
          amount = (baseSalary * template.amount) / 100;
        } else {
          amount = template.amount || 0;
        }
      }
      return {
        id: a.id,
        name: a.custom_name || a.allowance_template?.name || 'Allowance',
        amount,
      };
    });

    const deductionItems = deductions.map((d: any) => {
      let amount = 0;
      if (d.custom_amount) {
        amount = d.custom_amount;
      } else if (d.deduction_template) {
        const template = d.deduction_template;
        if (template.amount_type === 'percentage') {
          if (template.percentage_of === 'base_salary') {
            amount = (baseSalary * template.amount) / 100;
          } else if (template.percentage_of === 'gosi_registered_salary') {
            amount = ((employee?.gosi_registered_salary || 0) * template.amount) / 100;
          }
        } else {
          amount = template.amount || 0;
        }
      }
      return {
        id: d.id,
        name: d.custom_name || d.deduction_template?.name || 'Deduction',
        amount,
      };
    });

    // Auto-add GOSI deduction if employee is subject to GOSI
    // Also calculate employer contribution for display
    let employerGosiContribution = 0;
    let employerGosiRate = 0;
    let employeeGosiRate = 0;
    
    if (employee?.is_subject_to_gosi && employee?.gosi_registered_salary) {
      const employeeWorkLocation = workLocations?.find(loc => loc.id === employee.work_location_id);
      
      if (employeeWorkLocation?.gosi_enabled) {
        const rates = (employeeWorkLocation.gosi_nationality_rates || []) as Array<{nationality: string; employeeRate?: number; employerRate?: number; percentage?: number}>;
        const nationalityCode = getCountryCodeByName(employee.nationality || '');
        const matchingRate = rates.find(r => r.nationality === nationalityCode);
        
        if (matchingRate) {
          // Support both old (percentage) and new (employeeRate/employerRate) formats
          employeeGosiRate = matchingRate.employeeRate ?? matchingRate.percentage ?? 0;
          employerGosiRate = matchingRate.employerRate ?? 0;
          
          const gosiAmount = (employee.gosi_registered_salary * employeeGosiRate) / 100;
          deductionItems.push({
            id: 'gosi-auto',
            name: `GOSI (${employeeGosiRate}%)`,
            amount: gosiAmount,
          });
          
          // Calculate employer contribution for display
          employerGosiContribution = (employee.gosi_registered_salary * employerGosiRate) / 100;
        }
      }
    }

    const totalAllowances = allowanceItems.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductionItems.reduce((sum, d) => sum + d.amount, 0);
    const grossPay = baseSalary + totalAllowances;
    const totalMonthlySalary = grossPay - totalDeductions;

    return { baseSalary, allowanceItems, deductionItems, totalAllowances, totalDeductions, grossPay, totalMonthlySalary, employerGosiContribution, employerGosiRate };
  }, [employee?.salary, employee?.is_subject_to_gosi, employee?.gosi_registered_salary, employee?.work_location_id, employee?.nationality, workLocations, allowances, deductions]);
  
  // Check if viewing own profile
  const isOwnProfile = profile?.employee_id === id;
  // Check if this employee is a team member of the current user (for managers)
  const isTeamMemberOfCurrentUser = id ? isTeamMember(id) : false;
  // Full access if: viewing own profile OR has HR/Admin role OR is manager viewing their team member
  const hasFullAccess = isOwnProfile || canEditEmployees || isTeamMemberOfCurrentUser;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  if (!employee || error) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Employee not found</h2>
            <Button onClick={() => navigate('/employees')}>
              Back to Employees
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;

  const handleSave = (data: any) => {
    updateEmployee.mutate({
      id: employee.id,
      first_name: data.first_name || data.firstName,
      second_name: data.second_name || data.secondName || null,
      last_name: data.last_name || data.lastName,
      email: data.email,
      phone: data.phone,
      department_id: data.department_id || data.departmentId || null,
      position_id: data.position_id || data.positionId || null,
      status: data.status,
      join_date: data.join_date || data.joinDate,
      manager_id: data.manager_id || data.managerId || null,
      location: data.location,
      salary: data.salary,
      address: data.address,
      date_of_birth: data.date_of_birth || data.dateOfBirth,
      gender: data.gender as "male" | "female" | "other" | "prefer_not_to_say" | null,
      nationality: data.nationality,
      avatar_url: data.avatar_url || data.avatar,
      emergency_contact_name: data.emergency_contact_name || data.emergencyContact?.name,
      emergency_contact_phone: data.emergency_contact_phone || data.emergencyContact?.phone,
      emergency_contact_relationship: data.emergency_contact_relationship || data.emergencyContact?.relationship,
      is_subject_to_gosi: data.is_subject_to_gosi || data.isSubjectToGosi || false,
      gosi_registered_salary: data.gosi_registered_salary || data.gosiRegisteredSalary || null,
      passport_number: data.passport_number || data.passportNumber || null,
      cpr_number: data.cpr_number || data.cprNumber || null,
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Employee information has been saved.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "Failed to update employee profile.",
          variant: "destructive",
        });
      },
    });
  };

  const handleRoleChange = async (newRole: AppRole) => {
    if (!id) return;
    
    try {
      await updateEmployeeRole(id, newRole);
      toast({
        title: "Role updated",
        description: `Employee role has been changed to ${roleDescriptions[newRole] || newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee role.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => navigate('/employees')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Button>

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={employee.avatar_url || undefined} alt={employee.full_name || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.full_name}
                </h1>
                <StatusBadge status={employee.status} />
                <RoleBadge role={employeeRole} />
              </div>
              <p className="text-lg text-muted-foreground mb-1">{employee.position?.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.employee_code}
                </span>
                {employee.work_location?.name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {employee.work_location.name}
                  </span>
                )}
              </div>
            </div>
            
            {canEditEmployees && (
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setFormOpen(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <UserX className="h-4 w-4" />
                  Deactivate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="employment" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Employment
          </TabsTrigger>
          {hasFullAccess && (
            <>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="loans" className="gap-2">
                <Banknote className="h-4 w-4" />
                Loans
              </TabsTrigger>
              <TabsTrigger value="timeoff" className="gap-2">
                <Clock className="h-4 w-4" />
                Time Off
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="h-4 w-4" />
                Roles
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="First Name" value={employee.first_name} />
                {employee.second_name && (
                  <InfoRow label="Second Name" value={employee.second_name} />
                )}
                <InfoRow label="Last Name" value={employee.last_name} />
                <InfoRow label="Full Name" value={employee.full_name} />
                <InfoRow 
                  label="Date of Birth" 
                  value={employee.date_of_birth ? formatLongDate(employee.date_of_birth) : 'Not specified'} 
                />
                <InfoRow label="Gender" value={employee.gender || 'Not specified'} />
                <InfoRow label="Nationality" value={employee.nationality || 'Not specified'} />
                <InfoRow label="Passport Number" value={employee.passport_number} />
                <InfoRow label="CPR Number" value={employee.cpr_number} />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Email" value={employee.email} icon={<Mail className="h-4 w-4" />} />
                <InfoRow label="Phone" value={employee.phone} icon={<Phone className="h-4 w-4" />} />
                <InfoRow 
                  label="Address" 
                  value={employee.address || 'Not specified'} 
                  icon={<MapPin className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.emergency_contact_name ? (
                  <>
                    <InfoRow label="Name" value={employee.emergency_contact_name} />
                    <InfoRow label="Relationship" value={employee.emergency_contact_relationship} />
                    <InfoRow label="Phone" value={employee.emergency_contact_phone} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No emergency contact specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Details - Always visible */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Employee ID" value={employee.employee_code} />
                <InfoRow label="Department" value={employee.department?.name} />
                <InfoRow label="Position" value={employee.position?.title} />
                <InfoRow 
                  label="Join Date" 
                  value={employee.join_date ? formatLongDate(employee.join_date) : 'Not specified'} 
                />
                <InfoRow label="Work Location" value={employee.work_location?.name || 'Not specified'} />
              </CardContent>
            </Card>

            {/* Compensation - Only for those with access */}
            {hasFullAccess && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Base Salary" value={formatCurrency(compensationBreakdown.baseSalary)} />
                  
                  {compensationBreakdown.allowanceItems.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-xs font-medium text-muted-foreground uppercase">Allowances</p>
                      {compensationBreakdown.allowanceItems.map((item) => (
                        <InfoRow key={item.id} label={item.name} value={formatCurrency(item.amount)} />
                      ))}
                    </>
                  )}
                  
                  {compensationBreakdown.deductionItems.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-xs font-medium text-muted-foreground uppercase">Deductions</p>
                      {compensationBreakdown.deductionItems.map((item) => (
                        <InfoRow key={item.id} label={item.name} value={`-${formatCurrency(item.amount)}`} />
                      ))}
                    </>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Net Monthly Salary</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(compensationBreakdown.totalMonthlySalary)}</span>
                  </div>
                  
                  {/* Employer GOSI Contribution - Informational */}
                  {compensationBreakdown.employerGosiContribution > 0 && (
                    <>
                      <Separator />
                      <div className="bg-muted/30 rounded-lg p-3 mt-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                          Employer Contributions
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            GOSI Employer Contribution ({compensationBreakdown.employerGosiRate}%)
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {formatCurrency(compensationBreakdown.employerGosiContribution)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bank Details */}
            {hasFullAccess && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Bank Details
                  </CardTitle>
                  {canEditEmployees && (
                    <Button variant="ghost" size="sm" onClick={() => setBankDialogOpen(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Bank Name" value={employee.bank_name} />
                  <InfoRow label="Account Number" value={employee.bank_account_number} />
                  <InfoRow label="IBAN" value={employee.iban} />
                </CardContent>
              </Card>
            )}

            {/* Salary History */}
            {hasFullAccess && (
              <SalaryHistoryCard employeeId={employee.id} />
            )}
          </div>
        </TabsContent>

        {hasFullAccess && (
          <TabsContent value="documents" className="space-y-6">
            <EmployeeDocumentsTab employeeId={employee.id} canEdit={canEditEmployees} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="loans" className="space-y-6">
            <EmployeeLoansTab employeeId={employee.id} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="timeoff" className="space-y-6">
            <EmployeeTimeOffTab employeeId={employee.id} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="activity" className="space-y-6">
            <EmployeeActivityTab employeeId={employee.id} />
          </TabsContent>
        )}

        {hasFullAccess && (
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Role */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    System Role
                  </CardTitle>
                  <CardDescription>
                    The employee's access level and permissions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {canManageRoles ? (
                    <RoleSelectorWithDescription
                      value={employeeRole}
                      onValueChange={handleRoleChange}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <RoleBadge role={employeeRole} />
                      <span className="text-sm text-muted-foreground">
                        {roleDescriptions[employeeRole] || 'No description available'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Login Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Login Management
                  </CardTitle>
                  <CardDescription>
                    Manage the employee's system access and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {employee.id ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Login account active
                      </div>
                      {canManageRoles && (
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => setResetPasswordOpen(true)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset Password
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        No login account
                      </div>
                      {canManageRoles && (
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => setCreateLoginOpen(true)}
                        >
                          <KeyRound className="h-4 w-4" />
                          Create Login
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employee}
        onSave={handleSave}
      />
      
      <CreateLoginDialog
        open={createLoginOpen}
        onOpenChange={setCreateLoginOpen}
        employee={employee}
      />
      
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        employee={employee}
      />
      
      <BankDetailsDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        employee={employee}
      />
    </DashboardLayout>
  );
}
