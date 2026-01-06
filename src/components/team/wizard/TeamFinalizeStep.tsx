import { format } from "date-fns";
import { Edit2, Check, Mail, FileText, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCountryByCode } from "@/data/countries";
import { useActiveAllowanceTemplates } from "@/hooks/useAllowanceTemplates";
import { useActiveDeductionTemplates } from "@/hooks/useDeductionTemplates";
import { useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { TeamBasicData } from "./TeamBasicStep";
import { TeamRoleData } from "./TeamRoleStep";
import { TeamCompensationData } from "./TeamCompensationStep";
import { TeamOfferData } from "./TeamOfferStep";

interface TeamFinalizeStepProps {
  basicData: TeamBasicData;
  roleData: TeamRoleData;
  compensationData: TeamCompensationData;
  offerData: TeamOfferData;
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

  // Resolve IDs to display values
  const department = departments?.find(d => d.id === roleData.departmentId);
  const position = positions?.find(p => p.id === roleData.positionId);
  const manager = employees?.find(e => e.id === roleData.managerId);
  const workLocation = workLocations?.find(w => w.id === roleData.workLocationId);

  const selectedAllowanceNames = (allowanceTemplates || [])
    .filter(t => compensationData.selectedAllowances.includes(t.id))
    .map(t => t.name);

  const selectedDeductionNames = (deductionTemplates || [])
    .filter(t => compensationData.selectedDeductions.includes(t.id))
    .map(t => t.name);

  const formatSalary = () => {
    const amount = parseFloat(compensationData.salary) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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
          Review and finalize
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review all information before sending the offer
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
                  <AvatarImage src={manager.avatar} />
                  <AvatarFallback className="text-xs">
                    {manager.firstName[0]}
                    {manager.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {manager.firstName} {manager.lastName}
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
            <p className="text-muted-foreground">Salary</p>
            <p className="font-medium">
              {formatSalary()} / {compensationData.payFrequency}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Employee type</p>
            <p className="font-medium">{compensationData.employeeType || "Not set"}</p>
          </div>
          {selectedAllowanceNames.length > 0 && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Allowances</p>
              <div className="flex flex-wrap gap-1">
                {selectedAllowanceNames.map(name => (
                  <Badge key={name} variant="secondary" className="text-xs font-normal">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {selectedDeductionNames.length > 0 && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Deductions</p>
              <div className="flex flex-wrap gap-1">
                {selectedDeductionNames.map(name => (
                  <Badge key={name} variant="outline" className="text-xs font-normal">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offer Letter Information */}
      {offerData.sendOfferLetter && (
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
                {offerData.templateId === "new"
                  ? offerData.templateTitle || "New template"
                  : offerData.templateId}
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
          </CardContent>
        </Card>
      )}

      {/* What happens next */}
      <Card className="bg-muted/50">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Here's what happens next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Offer letter sent</p>
              <p className="text-muted-foreground">
                An offer letter will be sent to {basicData.email}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Documents prepared</p>
              <p className="text-muted-foreground">
                Onboarding documents will be prepared automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Onboarding starts</p>
              <p className="text-muted-foreground">
                Once accepted, the onboarding process will begin
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
