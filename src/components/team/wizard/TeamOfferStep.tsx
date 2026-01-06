import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { useCompanySettingsDb } from "@/hooks/useCompanySettingsDb";
import { useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { renderTemplate } from "@/utils/templateRenderer";
import { TeamBasicData } from "./TeamBasicStep";
import { TeamRoleData } from "./TeamRoleStep";
import { TeamCompensationData } from "./TeamCompensationStep";

export interface TeamOfferData {
  sendOfferLetter: boolean;
  setupBackgroundChecks: boolean;
  templateId: string;
  expirationDate: Date | undefined;
  signatureTitle: string;
  signatureName: string;
}

interface TeamOfferStepProps {
  data: TeamOfferData;
  onChange: (data: TeamOfferData) => void;
  basicData: TeamBasicData;
  roleData: TeamRoleData;
  compensationData: TeamCompensationData;
}

export function TeamOfferStep({
  data,
  onChange,
  basicData,
  roleData,
  compensationData,
}: TeamOfferStepProps) {
  const { data: templates } = useDocumentTemplates();
  const { settings: companySettings } = useCompanySettingsDb();
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const { data: workLocations } = useWorkLocations();
  const { data: employees } = useEmployees();

  // Filter to only offer letter templates
  const offerTemplates = useMemo(() => {
    return templates?.filter(t => t.category === "offer_letter" && t.is_active) || [];
  }, [templates]);

  const updateField = <K extends keyof TeamOfferData>(
    field: K,
    value: TeamOfferData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Get selected template
  const selectedTemplate = useMemo(() => {
    return offerTemplates.find(t => t.id === data.templateId);
  }, [offerTemplates, data.templateId]);

  // Get related data for preview
  const position = useMemo(() => 
    positions?.find(p => p.id === roleData.positionId), 
    [positions, roleData.positionId]
  );
  
  const department = useMemo(() => 
    departments?.find(d => d.id === roleData.departmentId), 
    [departments, roleData.departmentId]
  );
  
  const workLocation = useMemo(() => 
    workLocations?.find(w => w.id === roleData.workLocationId), 
    [workLocations, roleData.workLocationId]
  );
  
  const manager = useMemo(() => 
    employees?.find(e => e.id === roleData.managerId), 
    [employees, roleData.managerId]
  );

  // Render preview with all data from previous steps
  const previewContent = useMemo(() => {
    if (!selectedTemplate) return "";

    const offerExpiryDays = data.expirationDate 
      ? Math.max(1, differenceInDays(data.expirationDate, new Date()))
      : 7;

    return renderTemplate(selectedTemplate.content, {
      employee: {
        first_name: basicData.firstName,
        last_name: basicData.lastName,
        email: basicData.email,
        phone: basicData.mobileNumber,
        nationality: basicData.nationality,
        salary: parseFloat(compensationData.salary) || 0,
        join_date: roleData.startDate?.toISOString(),
      },
      position: position ? { title: position.title } : undefined,
      department: department ? { name: department.name } : undefined,
      workLocation: workLocation ? { 
        name: workLocation.name, 
        currency: workLocation.currency || compensationData.currency 
      } : { currency: compensationData.currency },
      manager: manager ? { 
        first_name: manager.firstName, 
        last_name: manager.lastName 
      } : undefined,
      company: companySettings ? {
        name: companySettings.name,
        legal_name: companySettings.legalName || undefined,
        email: companySettings.email || undefined,
        phone: companySettings.phone || undefined,
        logo_url: companySettings.branding?.logoUrl || undefined,
        address_street: companySettings.address?.street || undefined,
        address_city: companySettings.address?.city || undefined,
        address_state: companySettings.address?.state || undefined,
        address_country: companySettings.address?.country || undefined,
        address_zip_code: companySettings.address?.zipCode || undefined,
      } : undefined,
      signatureTitle: data.signatureTitle,
      signatureName: data.signatureName,
      offerExpiryDays,
    });
  }, [selectedTemplate, basicData, roleData, compensationData, data, position, department, workLocation, manager, companySettings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Offer letter details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the offer letter template and content
        </p>
      </div>

      {/* Hiring Options */}
      <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
        <Label className="text-base font-medium">Hiring options (optional)</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sendOffer"
              checked={data.sendOfferLetter}
              onCheckedChange={(checked) =>
                updateField("sendOfferLetter", checked as boolean)
              }
            />
            <Label htmlFor="sendOffer" className="cursor-pointer text-sm font-normal">
              Send an offer letter
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="backgroundChecks"
              checked={data.setupBackgroundChecks}
              onCheckedChange={(checked) =>
                updateField("setupBackgroundChecks", checked as boolean)
              }
            />
            <Label htmlFor="backgroundChecks" className="cursor-pointer text-sm font-normal">
              Set up background checks
            </Label>
          </div>
        </div>
      </div>

      {/* Conditional content - only show when sendOfferLetter is checked */}
      {data.sendOfferLetter && (
        <>
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Offer letter template *</Label>
            <Select
              value={data.templateId}
              onValueChange={(value) => updateField("templateId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {offerTemplates.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No offer letter templates found.
                    <br />
                    Create one in Documents → Templates.
                  </div>
                ) : (
                  offerTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label>Offer expiration date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.expirationDate ? (
                    format(data.expirationDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.expirationDate}
                  onSelect={(date) => updateField("expirationDate", date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Company Signature */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Signature title</Label>
              <Input
                placeholder="e.g., HR Director"
                value={data.signatureTitle}
                onChange={(e) => updateField("signatureTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Signature name</Label>
              <Input
                placeholder="e.g., John Smith"
                value={data.signatureName}
                onChange={(e) => updateField("signatureName", e.target.value)}
              />
            </div>
          </div>

          {/* Preview Section */}
          {selectedTemplate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label>Preview</Label>
              </div>
              <div className="border rounded-lg bg-card">
                <ScrollArea className="h-[400px]">
                  <div 
                    className="p-6 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </ScrollArea>
              </div>
              <p className="text-xs text-muted-foreground">
                This preview shows the offer letter with data from the previous steps filled in.
              </p>
            </div>
          )}

          {!selectedTemplate && data.templateId === "" && (
            <div className="p-4 rounded-lg border border-dashed bg-muted/20 text-center">
              <p className="text-sm text-muted-foreground">
                Select a template above to preview the offer letter
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
