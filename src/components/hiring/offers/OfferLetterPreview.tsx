import { useState, useEffect } from "react";
import { FileText, Download, FileType, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useOfferLetterTemplates } from "@/hooks/useOfferLetterTemplates";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useActiveSmartTags } from "@/hooks/useSmartTags";
import { useMyEmployee } from "@/hooks/useMyEmployee";
import { useSendOfferLetter, useUpdateOfferVersion } from "@/hooks/useOffers";
import { exportOfferLetterToDocx } from "@/utils/offerLetterExport";
import { getOfferLetterSmartTagData } from "@/utils/offerLetterSmartTags";
import type { OfferVersion } from "@/hooks/useOffers";
import { format } from "date-fns";
import { toast } from "sonner";

interface OfferLetterPreviewProps {
  version: OfferVersion;
  candidate?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export function OfferLetterPreview({ version, candidate }: OfferLetterPreviewProps) {
  const { data: templates } = useOfferLetterTemplates();
  const { settings } = useCompanySettings();
  const { data: smartTags } = useActiveSmartTags();
  const { data: currentUserEmployee } = useMyEmployee();
  const sendOfferLetter = useSendOfferLetter();
  const updateVersion = useUpdateOfferVersion();
  
  // Initialize with saved template_id if exists
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(version.template_id || "");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Update selection when version changes (e.g., switching between versions)
  useEffect(() => {
    setSelectedTemplateId(version.template_id || "");
  }, [version.template_id, version.id]);

  // Build current user info for smart tags (signature, etc.)
  const currentUser = currentUserEmployee ? {
    name: `${currentUserEmployee.firstName} ${currentUserEmployee.lastName}`,
    position: currentUserEmployee.position || null
  } : undefined;

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  // Replace placeholders in template for HTML preview
  const renderTemplate = (content: string) => {
    if (!content) return "";
    
    const placeholders: Record<string, string> = {
      "{candidate_name}": candidate ? `${candidate.first_name} ${candidate.last_name}` : "[Candidate Name]",
      "{job_title}": version.position?.title || "[Job Title]",
      "{department}": version.department?.name || "[Department]",
      "{work_location}": version.work_location?.name || "[Work Location]",
      "{start_date}": version.start_date ? format(new Date(version.start_date), "MMMM d, yyyy") : "[Start Date]",
      "{currency}": version.currency_code || "BHD",
      "{basic_salary}": version.basic_salary?.toLocaleString() || "0",
      "{housing_allowance}": version.housing_allowance?.toLocaleString() || "0",
      "{transport_allowance}": version.transport_allowance?.toLocaleString() || "0",
      "{other_allowances}": version.other_allowances?.toLocaleString() || "0",
      "{gross_pay_total}": version.gross_pay_total?.toLocaleString() || "0",
      "{employer_gosi_amount}": version.employer_gosi_amount?.toLocaleString() || "0",
      "{company_name}": settings?.name || "[Company Name]",
      "{current_date}": format(new Date(), "MMMM d, yyyy"),
    };

    let rendered = content;
    Object.entries(placeholders).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return rendered;
  };

  const handleDownloadDocxPreview = async () => {
    if (!selectedTemplate || !candidate) return;
    
    setIsDownloading(true);
    try {
      // Build full address from settings
      const fullAddress = settings?.address
        ? [
            settings.address.street,
            settings.address.city,
            settings.address.state,
            settings.address.zipCode,
            settings.address.country,
          ].filter(Boolean).join(", ")
        : null;

      const smartTagData = getOfferLetterSmartTagData(
        version,
        candidate,
        { 
          name: settings?.name || null, 
          legal_name: settings?.legalName || null,
          email: settings?.email || null,
          phone: settings?.phone || null,
          fullAddress,
          logoUrl: settings?.branding?.documentLogoUrl || settings?.branding?.logoUrl || null,
        },
        smartTags,
        currentUser
      );
      
      await exportOfferLetterToDocx(
        selectedTemplate.docx_template_url!,
        smartTagData,
        `offer-letter-${candidate.first_name}-${candidate.last_name}.docx`
      );
      toast.success("Preview downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download preview");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedTemplateId || !candidate) {
      toast.error("Please select a template first");
      return;
    }
    
    setIsSending(true);
    try {
      // First, save the template selection to the version
      await updateVersion.mutateAsync({
        versionId: version.id,
        data: { template_id: selectedTemplateId }
      });
      
      // Then send the offer letter
      await sendOfferLetter.mutateAsync({
        versionId: version.id,
        templateId: selectedTemplateId,
        senderEmployeeId: currentUserEmployee?.id || undefined
      });
      
      toast.success("Offer letter sent successfully!");
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send offer letter");
    } finally {
      setIsSending(false);
    }
  };

  const activeTemplates = templates?.filter(t => t.is_active) || [];
  const canSend = version.status === 'draft' && selectedTemplateId && candidate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Offer Letter Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Template</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an offer letter template" />
            </SelectTrigger>
            <SelectContent>
              {activeTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.template_type === 'docx' ? (
                      <FileType className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{template.template_name}</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {template.template_type === 'docx' ? 'DOCX' : 'HTML'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <>
            <Separator />
            
            {selectedTemplate.template_type === 'docx' ? (
              /* DOCX Template Preview */
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-full">
                  <FileType className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Word Document Template</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTemplate.docx_original_filename}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  When sent, this document will be filled with the offer details and converted to PDF so the recipient cannot edit it.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadDocxPreview}
                  disabled={isDownloading || !candidate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Preview (DOCX)"}
                </Button>
              </div>
            ) : (
              /* HTML Template Preview */
              <>
                {/* Email Preview */}
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">To: </span>
                    <span className="font-medium">{candidate?.email || "[Candidate Email]"}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Subject: </span>
                    <span className="font-medium">{renderTemplate(selectedTemplate.subject_template || "")}</span>
                  </div>
                </div>

                <Separator />

                {/* Letter Content Preview */}
                <div>
                  <Label className="mb-2 block">Letter Preview</Label>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-white">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderTemplate(selectedTemplate.body_template || "") }}
                    />
                  </ScrollArea>
                </div>

                {/* Placeholder Reference */}
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">Available Placeholders:</p>
                  <p className="font-mono break-all">
                    {'{candidate_name}'}, {'{job_title}'}, {'{department}'}, {'{work_location}'}, {'{start_date}'}, {'{currency}'}, {'{basic_salary}'}, {'{housing_allowance}'}, {'{transport_allowance}'}, {'{other_allowances}'}, {'{gross_pay_total}'}, {'{employer_gosi_amount}'}, {'{company_name}'}, {'{current_date}'}
                  </p>
                </div>
              </>
            )}

            {/* Send Offer Button */}
            {canSend && (
              <>
                <Separator />
                <Button 
                  onClick={handleSendOffer} 
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? "Sending..." : "Send Offer Letter"}
                </Button>
              </>
            )}
          </>
        )}

        {!selectedTemplate && activeTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active templates available</p>
            <p className="text-sm">Create a template in the Templates tab</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
