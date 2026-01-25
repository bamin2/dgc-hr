import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Smartphone,
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
  Heart,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEmployeeAllowances } from "@/hooks/useEmployeeAllowances";
import { useEmployeeDeductions } from "@/hooks/useEmployeeDeductions";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, EmployeeForm, RoleBadge, RoleSelectorWithDescription, CreateLoginDialog, ResetPasswordDialog, SalaryHistoryCard, BankDetailsDialog, EmployeeTimeOffTab, EmployeeActivityTab } from "@/components/employees";
import { EmployeeDocumentsTab } from "@/components/employees/documents";
import { EmployeeLoansTab } from "@/components/employees/EmployeeLoansTab";
import { EmployeeBenefitsTab } from "@/components/employees/EmployeeBenefitsTab";
import { useEmployee, useUpdateEmployee, useEmployees, Employee } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { getCountryByName, getCountryCodeByName } from "@/data/countries";
import { AppRole, roleDescriptions, roleLabels } from "@/data/roles";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
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
  const { getEmployeeRole, updateEmployeeRole, canManageRoles, canEditEmployees, isTeamMember, userRoles } = useRole();
  const { profile } = useAuth();
  const { data: employee, isLoading, error } = useEmployee(id);
  const { data: allEmployees = [] } = useEmployees();
  const { data: allowances = [] } = useEmployeeAllowances(id);
  const { data: deductions = [] } = useEmployeeDeductions(id);
  const updateEmployee = useUpdateEmployee();
  const { logAction } = useAuditLog();
  const [formOpen, setFormOpen] = useState(false);
  const [createLoginOpen, setCreateLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const [isCompensationVisible, setIsCompensationVisible] = useState(false);
  const { data: workLocations } = useWorkLocations();
  const employeeRole = useMemo(() => {
    if (!employee) return 'employee';

    // Roles can be keyed by either employee.id or the linked auth user_id
    const roleByEmployeeId = id ? getEmployeeRole(id) : 'employee';
    if (roleByEmployeeId !== 'employee') return roleByEmployeeId;

    const linkedUserId = (employee as any).userId as string | undefined;
    return linkedUserId ? getEmployeeRole(linkedUserId) : roleByEmployeeId;
  }, [id, employee, getEmployeeRole, userRoles]);
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
            amount = ((employee?.gosiRegisteredSalary || 0) * template.amount) / 100;
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
    
    if (employee?.isSubjectToGosi && employee?.gosiRegisteredSalary) {
      const employeeWorkLocation = workLocations?.find(loc => loc.id === employee.workLocationId);
      
      if (employeeWorkLocation?.gosi_enabled) {
        const rates = (employeeWorkLocation.gosi_nationality_rates || []) as Array<{nationality: string; employeeRate?: number; employerRate?: number; percentage?: number}>;
        const nationalityCode = getCountryCodeByName(employee.nationality || '');
        const matchingRate = rates.find(r => r.nationality === nationalityCode);
        
        if (matchingRate) {
          // Support both old (percentage) and new (employeeRate/employerRate) formats
          employeeGosiRate = matchingRate.employeeRate ?? matchingRate.percentage ?? 0;
          employerGosiRate = matchingRate.employerRate ?? 0;
          
          const gosiAmount = (employee.gosiRegisteredSalary * employeeGosiRate) / 100;
          deductionItems.push({
            id: 'gosi-auto',
            name: `GOSI (${employeeGosiRate}%)`,
            amount: gosiAmount,
          });
          
          // Calculate employer contribution for display
          employerGosiContribution = (employee.gosiRegisteredSalary * employerGosiRate) / 100;
        }
      }
    }

    const totalAllowances = allowanceItems.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductionItems.reduce((sum, d) => sum + d.amount, 0);
    const grossPay = baseSalary + totalAllowances;
    const totalMonthlySalary = grossPay - totalDeductions;

    return { baseSalary, allowanceItems, deductionItems, totalAllowances, totalDeductions, grossPay, totalMonthlySalary, employerGosiContribution, employerGosiRate };
  }, [employee?.salary, employee?.isSubjectToGosi, employee?.gosiRegisteredSalary, employee?.workLocationId, employee?.nationality, workLocations, allowances, deductions]);
  
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

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  const handleSave = (data: Partial<Employee>) => {
    updateEmployee.mutate({
      id: employee.id,
      first_name: data.firstName,
      second_name: data.secondName || null,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      mobile_country_code: data.mobileCountryCode || null,
      office_phone: data.officePhone || null,
      office_country_code: data.officeCountryCode || null,
      department_id: data.departmentId || null,
      position_id: data.positionId || null,
      status: data.status,
      join_date: data.joinDate || null,
      manager_id: data.managerId || null,
      location: data.location,
      salary: data.salary,
      address: data.address,
      date_of_birth: data.dateOfBirth || null,
      gender: data.gender ? (data.gender as "male" | "female" | "other" | "prefer_not_to_say") : null,
      nationality: data.nationality,
      avatar_url: data.avatar,
      emergency_contact_name: data.emergencyContact?.name,
      emergency_contact_phone: data.emergencyContact?.phone,
      emergency_contact_relationship: data.emergencyContact?.relationship,
      is_subject_to_gosi: data.isSubjectToGosi || false,
      gosi_registered_salary: data.gosiRegisteredSalary || null,
      passport_number: data.passportNumber || null,
      cpr_number: data.cprNumber || null,
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

  // Initiate role change - opens confirmation dialog
  const initiateRoleChange = (newRole: AppRole) => {
    if (!id || newRole === employeeRole) return;
    setPendingRole(newRole);
    setRoleChangeDialogOpen(true);
  };

  // Confirm and execute the role change
  const confirmRoleChange = async () => {
    if (!id || !pendingRole) return;

    const previousRole = employeeRole;
    const result = await updateEmployeeRole(id, pendingRole);

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setRoleChangeDialogOpen(false);
      setPendingRole(null);
      return;
    }

    // Log the role change to audit logs
    try {
      await logAction({
        entityType: 'employee',
        entityId: id,
        employeeId: id,
        action: 'update',
        fieldName: 'system_role',
        oldValue: roleLabels[previousRole],
        newValue: roleLabels[pendingRole],
        description: `Changed system role from ${roleLabels[previousRole]} to ${roleLabels[pendingRole]}`,
      });
    } catch (auditError) {
      console.error('Failed to log role change:', auditError);
      // Non-blocking - role change succeeded even if audit log fails
    }

    toast({
      title: "Role updated",
      description: `Employee role has been changed to ${roleDescriptions[pendingRole]}.`,
    });

    setRoleChangeDialogOpen(false);
    setPendingRole(null);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.position} • ${employee.department}`}
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: employee.fullName },
        ]}
        actions={
          canEditEmployees && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setFormOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Message</span>
              </Button>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
            </div>
          )
        }
      />

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={employee.avatar} alt={employee.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.fullName}
                </h1>
                <StatusBadge status={employee.status} />
                <RoleBadge role={employeeRole} />
              </div>
              <p className="text-lg text-muted-foreground mb-1">{employee.position}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.employeeId}
                </span>
                {employee.workLocationName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {employee.workLocationCountry && (
                      <span>{getCountryByName(employee.workLocationCountry)?.flag}</span>
                    )}
                    {employee.workLocationName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="employment">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Employment</span>
          </TabsTrigger>
          {hasFullAccess && (
            <>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="loans">
                <Banknote className="h-4 w-4" />
                <span className="hidden sm:inline">Loans</span>
              </TabsTrigger>
              <TabsTrigger value="benefits">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Benefits</span>
              </TabsTrigger>
              <TabsTrigger value="timeoff">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Time Off</span>
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Roles</span>
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
                <InfoRow label="First Name" value={employee.firstName} />
                {employee.secondName && (
                  <InfoRow label="Second Name" value={employee.secondName} />
                )}
                <InfoRow label="Last Name" value={employee.lastName} />
                <InfoRow label="Full Name" value={employee.fullName} />
                <InfoRow 
                  label="Date of Birth" 
                  value={employee.dateOfBirth ? formatLongDate(employee.dateOfBirth) : 'Not specified'} 
                />
                <InfoRow label="Gender" value={employee.gender || 'Not specified'} />
                <InfoRow label="Nationality" value={employee.nationality || 'Not specified'} />
                <InfoRow label="Passport Number" value={employee.passportNumber} />
                <InfoRow label="CPR Number" value={employee.cprNumber} />
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
                <InfoRow label="Mobile" value={employee.phone} icon={<Smartphone className="h-4 w-4" />} />
                <InfoRow label="Office" value={employee.officePhone} icon={<Phone className="h-4 w-4" />} />
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
                {employee.emergencyContact ? (
                  <>
                    <InfoRow label="Name" value={employee.emergencyContact.name} />
                    <InfoRow label="Relationship" value={employee.emergencyContact.relationship} />
                    <InfoRow label="Phone" value={employee.emergencyContact.phone} />
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
                <InfoRow label="Employee ID" value={employee.employeeId} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Position" value={employee.position} />
                <InfoRow 
                  label="Join Date" 
                  value={employee.joinDate ? formatLongDate(employee.joinDate) : 'Not specified'} 
                />
                <InfoRow label="Work Location" value={employee.workLocationName || 'Not specified'} />
              </CardContent>
            </Card>

            {/* Compensation - Only for those with access */}
            {hasFullAccess && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Compensation
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCompensationVisible(!isCompensationVisible)}
                      className="h-8 w-8"
                    >
                      {isCompensationVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  {/* Blur overlay when hidden */}
                  {!isCompensationVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-lg z-10">
                      <button
                        onClick={() => setIsCompensationVisible(true)}
                        className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="h-8 w-8" />
                        <span className="text-sm font-medium">Click to reveal</span>
                      </button>
                    </div>
                  )}
                  <div className={!isCompensationVisible ? 'blur-md select-none' : ''}>
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
                  </div>
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
                  <InfoRow label="Bank Name" value={employee.bankName} />
                  <InfoRow label="Account Number" value={employee.bankAccountNumber} />
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
          <TabsContent value="benefits" className="space-y-6">
            <EmployeeBenefitsTab employeeId={employee.id} />
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
                      onValueChange={initiateRoleChange}
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
                  {employee.userId ? (
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

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Change System Role?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to change <strong>{employee.fullName}</strong>'s role:
                </p>
                
                <div className="rounded-lg border p-3 space-y-2 bg-muted/50">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground text-sm min-w-16">Current:</span>
                    <div>
                      <span className="text-sm font-medium">{roleLabels[employeeRole]}</span>
                      <p className="text-xs text-muted-foreground">{roleDescriptions[employeeRole]}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground text-sm min-w-16">New:</span>
                    <div>
                      <span className="text-sm font-medium">{pendingRole ? roleLabels[pendingRole] : ''}</span>
                      <p className="text-xs text-muted-foreground">{pendingRole ? roleDescriptions[pendingRole] : ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-3">
                  <Shield className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-sm text-warning-foreground">
                    <strong>Warning:</strong> This will immediately change their access permissions throughout the system.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRole(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
