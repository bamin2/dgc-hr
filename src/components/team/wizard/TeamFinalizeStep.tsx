import { format } from "date-fns";
import { Edit2, Check, Mail, FileText, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCountryByCode } from "@/data/countries";
import { getCurrencyByCode } from "@/data/currencies";
import { useActiveAllowanceTemplates } from "@/hooks/useAllowanceTemplates";
import { useActiveDeductionTemplates } from "@/hooks/useDeductionTemplates";
import { useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { TeamBasicData } from "./TeamBasicStep";
import { TeamRoleData } from "./TeamRoleStep";
import { TeamCompensationData } from "./TeamCompensationStep";
import { TeamOfferData } from "./TeamOfferStep";

interface TeamFinalizeStepProps {
  basicData: TeamBasicData;
  roleData: TeamRoleData;
  compensationData: TeamCompensationData;
  offerData?: TeamOfferData;
  note: string;
  onNoteChange: (note: string) => void;
  onEditStep: (step: number) => void;
}

export function TeamFinalizeStep({
  basicData,
  roleData,
  compensationData,
  offerData,
  note,
  onNoteChange,
  onEditStep,
}: TeamFinalizeStepProps) {
  const country = getCountryByCode(basicData.nationality);
  const phoneCountry = getCountryByCode(basicData.mobileCountryCode);
  
  // Fetch reference data to resolve IDs to names
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const { data: employees } = useEmployees();
  const { data: workLocations } = useWorkLocations();
  const { data: allowanceTemplates } = useActiveAllowanceTemplates();
  const { data: deductionTemplates } = useActiveDeductionTemplates();
  const { data: documentTemplates } = useDocumentTemplates();

  // Resolve IDs to display values
  const department = departments?.find(d => d.id === roleData.departmentId);
  const position = positions?.find(p => p.id === roleData.positionId);
  const manager = employees?.find(e => e.id === roleData.managerId);
  const workLocation = workLocations?.find(w => w.id === roleData.workLocationId);
  const offerTemplate = offerData ? documentTemplates?.find(t => t.id === offerData.templateId) : null;

  // Get allowance names from the new structure
  const allowanceNames = compensationData.allowances.map(a => {
    if (a.isCustom) {
      return a.customName || "Custom Allowance";
    }
    const template = allowanceTemplates?.find(t => t.id === a.templateId);
    return template?.name || "Unknown";
  });

  // Get deduction names from the new structure
  const deductionNames = compensationData.deductions.map(d => {
    if (d.isCustom) {
      return d.customName || "Custom Deduction";
    }
    const template = deductionTemplates?.find(t => t.id === d.templateId);
    return template?.name || "Unknown";
  });

  const formatSalary = () => {
    const amount = parseFloat(compensationData.salary) || 0;
    const currency = getCurrencyByCode(compensationData.currency);
    return `${currency?.symbol || "$"}${amount.toLocaleString()}`;
  };

  const formatEmploymentStatus = () => {
    return compensationData.employmentStatus === "full_time" ? "Full-Time" : "Part-Time";
  };

  const getFullName = () => {
    const parts = [basicData.firstName, basicData.secondName, basicData.lastName].filter(Boolean);
    return parts.join(" ");
  };

  const getFullPhone = () => {
    if (!basicData.mobileNumber) return null;
    return `${phoneCountry?.dialCode || ""} ${basicData.mobileNumber}`.trim();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Review and add employee
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review all information before adding this employee
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(1)}
            className="h-8"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Full name</p>
            <p className="font-medium">{getFullName()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{basicData.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nationality</p>
            <p className="font-medium">
              {country ? `${country.flag} ${country.name}` : "Not set"}
            </p>
          </div>
          {getFullPhone() && (
            <div>
              <p className="text-muted-foreground">Mobile</p>
              <p className="font-medium">{getFullPhone()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">Role Information</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(2)}
            className="h-8"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Job title</p>
            <p className="font-medium">{position?.title || "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Department</p>
            <p className="font-medium">{department?.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Work location</p>
            <p className="font-medium">{workLocation?.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start date</p>
            <p className="font-medium">
              {roleData.startDate ? format(roleData.startDate, "PPP") : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Manager</p>
            {manager ? (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={manager.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {manager.first_name[0]}
                    {manager.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {manager.first_name} {manager.last_name}
                </span>
              </div>
            ) : (
              <p className="font-medium">Not set</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compensation Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">Compensation Information</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(3)}
            className="h-8"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Basic Salary</p>
            <p className="font-medium">
              {formatSalary()} / month
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Employment status</p>
            <p className="font-medium">{formatEmploymentStatus()}</p>
          </div>
          {allowanceNames.length > 0 && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Allowances</p>
              <div className="flex flex-wrap gap-1">
                {allowanceNames.map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {deductionNames.length > 0 && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Deductions</p>
              <div className="flex flex-wrap gap-1">
                {deductionNames.map((name, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-normal">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offer Letter Information */}
      {offerData?.sendOfferLetter && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Offer Letter</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              className="h-8"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Template</p>
              <p className="font-medium">
                {offerTemplate?.name || "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiration</p>
              <p className="font-medium">
                {offerData.expirationDate
                  ? format(offerData.expirationDate, "PPP")
                  : "Not set"}
              </p>
            </div>
            {offerData.signatureName && (
              <div>
                <p className="text-muted-foreground">Signature</p>
                <p className="font-medium">
                  {offerData.signatureName}
                  {offerData.signatureTitle && ` (${offerData.signatureTitle})`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* What happens next */}
      <Card className="bg-muted/50">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            What happens when you add this employee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Employee created as Active</p>
              <p className="text-muted-foreground">
                They will appear in the employee directory immediately
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Compensation set up</p>
              <p className="text-muted-foreground">
                Salary, allowances, and deductions will be configured
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <div className="space-y-2">
        <Label>Add a note for the employee (optional)</Label>
        <Textarea
          placeholder="Write a personal welcome message..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
