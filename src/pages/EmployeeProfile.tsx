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
} from "lucide-react";
import { useEmployeeAllowances } from "@/hooks/useEmployeeAllowances";
import { useEmployeeDeductions } from "@/hooks/useEmployeeDeductions";
import { Separator } from "@/components/ui/separator";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, EmployeeForm, RoleBadge, RoleSelectorWithDescription, CreateLoginDialog, ResetPasswordDialog, SalaryHistoryCard, BankDetailsDialog } from "@/components/employees";
import { useEmployee, useUpdateEmployee, useEmployees, Employee } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { getCountryByName, getCountryCodeByName } from "@/data/countries";
import { AppRole, roleDescriptions } from "@/data/roles";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
    if (employee?.isSubjectToGosi && employee?.gosiRegisteredSalary) {
      const employeeWorkLocation = workLocations?.find(loc => loc.id === employee.workLocationId);
      
      if (employeeWorkLocation?.gosi_enabled) {
        const rates = (employeeWorkLocation.gosi_nationality_rates || []) as Array<{nationality: string; percentage: number}>;
        const nationalityCode = getCountryCodeByName(employee.nationality || '');
        const matchingRate = rates.find(r => r.nationality === nationalityCode);
        
        if (matchingRate) {
          const gosiAmount = (employee.gosiRegisteredSalary * matchingRate.percentage) / 100;
          deductionItems.push({
            id: 'gosi-auto',
            name: `GOSI (${matchingRate.percentage}%)`,
            amount: gosiAmount,
          });
        }
      }
    }

    const totalAllowances = allowanceItems.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductionItems.reduce((sum, d) => sum + d.amount, 0);
    const totalMonthlySalary = baseSalary + totalAllowances - totalDeductions;

    return { baseSalary, allowanceItems, deductionItems, totalAllowances, totalDeductions, totalMonthlySalary };
  }, [employee?.salary, employee?.isSubjectToGosi, employee?.gosiRegisteredSalary, employee?.workLocationId, employee?.nationality, workLocations, allowances, deductions]);
  
  // Check if viewing own profile
  const isOwnProfile = profile?.employee_id === id;
  // Check if this employee is a team member of the current user (for managers)
  const isTeamMemberOfCurrentUser = id ? isTeamMember(id) : false;
  // Full access if: viewing own profile OR has HR/Admin role OR is manager viewing their team member
  const hasFullAccess = isOwnProfile || canEditEmployees || isTeamMemberOfCurrentUser;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-48 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (!employee || error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Employee not found</h2>
              <Button onClick={() => navigate('/employees')}>
                Back to Employees
              </Button>
            </div>
          </main>
        </div>
      </div>
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
      department_id: data.departmentId || null,
      position_id: data.positionId || null,
      status: data.status,
      join_date: data.joinDate,
      manager_id: data.managerId || null,
      location: data.location,
      salary: data.salary,
      address: data.address,
      date_of_birth: data.dateOfBirth,
      gender: data.gender as "male" | "female" | "other" | "prefer_not_to_say" | null,
      nationality: data.nationality,
      avatar_url: data.avatar,
      emergency_contact_name: data.emergencyContact?.name,
      emergency_contact_phone: data.emergencyContact?.phone,
      emergency_contact_relationship: data.emergencyContact?.relationship,
      is_subject_to_gosi: data.isSubjectToGosi || false,
      gosi_registered_salary: data.gosiRegisteredSalary || null,
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
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
                    <InfoRow label="First Name" value={employee.firstName} />
                    {employee.secondName && (
                      <InfoRow label="Second Name" value={employee.secondName} />
                    )}
                    <InfoRow label="Last Name" value={employee.lastName} />
                    <InfoRow label="Full Name" value={employee.fullName} />
                    <InfoRow 
                      label="Date of Birth" 
                      value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'MMMM d, yyyy') : 'Not specified'} 
                    />
                    <InfoRow label="Gender" value={employee.gender || 'Not specified'} />
                    <InfoRow label="Nationality" value={employee.nationality || 'Not specified'} />
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
                      value={format(new Date(employee.joinDate), 'MMMM d, yyyy')} 
                    />
                    <InfoRow label="Manager" value={(() => {
                      if (!employee.managerId) return 'Not assigned';
                      const mgr = allEmployees.find(e => e.id === employee.managerId);
                      return mgr ? `${mgr.firstName} ${mgr.lastName}` : employee.manager || 'Not assigned';
                    })()} />
                  </CardContent>
                </Card>

                {/* Compensation - Only for own profile or HR/Admin */}
                {hasFullAccess && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Compensation
                      </CardTitle>
                  {canEditEmployees && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setBankDialogOpen(true)}
                    >
                      Edit Bank Account Details
                    </Button>
                  )}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {/* Basic Salary */}
                      <InfoRow 
                        label="Basic Salary" 
                        value={formatCurrency(employee.salary)} 
                      />
                      
                      {/* Allowances Section */}
                      {compensationBreakdown.allowanceItems.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Allowances</p>
                          {compensationBreakdown.allowanceItems.map((allowance) => (
                            <InfoRow
                              key={allowance.id}
                              label={allowance.name}
                              value={formatCurrency(allowance.amount)}
                            />
                          ))}
                        </>
                      )}
                      
                      {/* Deductions Section */}
                      {compensationBreakdown.deductionItems.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deductions</p>
                          {compensationBreakdown.deductionItems.map((deduction) => (
                            <InfoRow
                              key={deduction.id}
                              label={deduction.name}
                              value={`-${formatCurrency(deduction.amount)}`}
                            />
                          ))}
                        </>
                      )}
                      
                      {/* Total Monthly Salary */}
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm font-semibold">Total Monthly Salary</span>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(compensationBreakdown.totalMonthlySalary)}
                        </span>
                      </div>
                      
                      {/* Bank Account */}
                      <Separator className="my-2" />
                      <InfoRow 
                        label="Bank Account" 
                        value={employee.iban 
                          ? `${employee.bankName || "Bank"} ••••${employee.iban.slice(-4)}` 
                          : "Not specified"
                        } 
                      />
                    </CardContent>
                  </Card>
                )}
                
                <BankDetailsDialog
                  open={bankDialogOpen}
                  onOpenChange={setBankDialogOpen}
                  employee={employee}
                />
              </div>

              {/* Salary History - Only for own profile or HR/Admin */}
              {hasFullAccess && (
                <SalaryHistoryCard employeeId={employee.id} />
              )}
            </TabsContent>

            {hasFullAccess && (
              <>
                <TabsContent value="documents">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No documents uploaded</h3>
                      <p className="text-muted-foreground mb-4">
                        Upload contracts, certificates, and other important documents
                      </p>
                      {canEditEmployees && (
                        <Button variant="outline">Upload Document</Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeoff">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Annual Leave</div>
                        <div className="text-2xl font-bold text-foreground">12 days</div>
                        <div className="text-xs text-muted-foreground">remaining of 20</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Sick Leave</div>
                        <div className="text-2xl font-bold text-foreground">8 days</div>
                        <div className="text-xs text-muted-foreground">remaining of 10</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Personal Leave</div>
                        <div className="text-2xl font-bold text-foreground">3 days</div>
                        <div className="text-xs text-muted-foreground">remaining of 5</div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Leave History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">No leave requests found.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ActivityItem
                        date="Today"
                        action="Clocked in at 9:02 AM"
                      />
                      <ActivityItem
                        date="Yesterday"
                        action="Submitted expense report for $234.50"
                      />
                      <ActivityItem
                        date="2 days ago"
                        action="Completed onboarding training module"
                      />
                      <ActivityItem
                        date="1 week ago"
                        action="Updated profile information"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Role */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Current Role
                        </CardTitle>
                        <CardDescription>
                          The employee's current access level and permissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <RoleBadge role={employeeRole} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {roleDescriptions[employeeRole]}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Role Assignment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Assign Role
                        </CardTitle>
                        <CardDescription>
                          {canManageRoles 
                            ? "Change this employee's role and permissions"
                            : "Only HR and Admin can change roles"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <RoleSelectorWithDescription
                          value={employeeRole}
                          onValueChange={async (newRole: AppRole) => {
                            if (id) {
                              const result = await updateEmployeeRole(id, newRole);
                              if (result?.error) {
                                toast({
                                  title: "Failed to update role",
                                  description: result.error,
                                  variant: "destructive",
                                });
                              } else {
                                toast({
                                  title: "Role updated",
                                  description: `${employee.firstName}'s role has been changed to ${newRole}.`,
                                });
                              }
                            }
                          }}
                          disabled={!canManageRoles}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Access (HR/Admin only) */}
                  {canManageRoles && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-primary" />
                          Account Access
                        </CardTitle>
                        <CardDescription>
                          Manage login credentials for this employee
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setCreateLoginOpen(true)}
                        >
                          <KeyRound className="h-4 w-4" />
                          Create Login
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setResetPasswordOpen(true)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset Password
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Role Permissions Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Role Permissions</CardTitle>
                      <CardDescription>
                        What each role can access in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(['employee', 'manager', 'hr', 'admin'] as AppRole[]).map((role) => (
                          <div 
                            key={role} 
                            className={`p-4 rounded-lg border ${role === employeeRole ? 'border-primary bg-primary/5' : 'border-border'}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <RoleBadge role={role} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {roleDescriptions[role]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employee}
        onSave={handleSave}
      />

      <CreateLoginDialog
        open={createLoginOpen}
        onOpenChange={setCreateLoginOpen}
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        }}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        }}
      />
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ date, action }: { date: string; action: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
      <div>
        <p className="text-sm text-foreground">{action}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
