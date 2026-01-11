import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOfferLetterTemplate, useCreateOfferLetterTemplate, useUpdateOfferLetterTemplate, type TemplateFormData } from "@/hooks/useOfferLetterTemplates";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

const PLACEHOLDERS = [
  { key: "candidate_name", desc: "Full name of candidate" },
  { key: "job_title", desc: "Position title" },
  { key: "department", desc: "Department name" },
  { key: "work_location", desc: "Work location" },
  { key: "start_date", desc: "Start date" },
  { key: "currency", desc: "Currency code (SAR, BHD)" },
  { key: "basic_salary", desc: "Basic salary amount" },
  { key: "housing_allowance", desc: "Housing allowance" },
  { key: "transport_allowance", desc: "Transport allowance" },
  { key: "other_allowances", desc: "Other allowances" },
  { key: "gross_pay_total", desc: "Total gross pay" },
  { key: "employer_gosi_amount", desc: "Employer GOSI contribution" },
  { key: "company_name", desc: "Company name" },
  { key: "current_date", desc: "Current date" },
];

interface TemplateEditorProps {
  templateId: string | null;
  onSuccess: () => void;
}

export function TemplateEditor({ templateId, onSuccess }: TemplateEditorProps) {
  const { settings } = useCompanySettings();
  const { data: template } = useOfferLetterTemplate(templateId || undefined);
  const createTemplate = useCreateOfferLetterTemplate();
  const updateTemplate = useUpdateOfferLetterTemplate();
  const [showPreview, setShowPreview] = useState(false);

  const getSampleData = (): Record<string, string> => ({
    "{candidate_name}": "Ahmed Al-Rashid",
    "{job_title}": "Senior Software Engineer",
    "{department}": "Engineering",
    "{work_location}": "Riyadh Office",
    "{start_date}": format(new Date(), "MMMM d, yyyy"),
    "{currency}": "SAR",
    "{basic_salary}": "15,000",
    "{housing_allowance}": "3,000",
    "{transport_allowance}": "1,500",
    "{other_allowances}": "500",
    "{gross_pay_total}": "20,000",
    "{employer_gosi_amount}": "1,800",
    "{company_name}": settings?.name || "Your Company",
    "{current_date}": format(new Date(), "MMMM d, yyyy"),
  });

  const renderPreview = (content: string): string => {
    const sampleData = getSampleData();
    let rendered = content;
    Object.entries(sampleData).forEach(([placeholder, value]) => {
      rendered = rendered.split(placeholder).join(value);
    });
    return rendered;
  };

  const { register, handleSubmit, setValue, watch, reset } = useForm<TemplateFormData>({
    defaultValues: {
      template_name: "",
      description: "",
      subject_template: "Offer Letter - {job_title} at {company_name}",
      body_template: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        template_name: template.template_name,
        description: template.description || "",
        subject_template: template.subject_template,
        body_template: template.body_template,
        is_active: template.is_active,
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: TemplateFormData) => {
    if (templateId) {
      await updateTemplate.mutateAsync({ id: templateId, data });
    } else {
      await createTemplate.mutateAsync(data);
    }
    onSuccess();
  };

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template_name">Template Name *</Label>
          <Input id="template_name" {...register("template_name", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">Active</Label>
          <Switch id="is_active" checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject_template">Email Subject</Label>
          <Input id="subject_template" {...register("subject_template")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body_template">Email Body (HTML)</Label>
          <Textarea id="body_template" {...register("body_template")} rows={12} className="font-mono text-sm" />
        </div>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Available Placeholders</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {PLACEHOLDERS.map((p) => (
              <div key={p.key} className="flex items-center gap-2">
                <code className="bg-muted px-1 py-0.5 rounded">{`{${p.key}}`}</code>
                <span className="text-muted-foreground truncate">{p.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                <p className="text-sm border rounded-md p-2 bg-muted/50">
                  {renderPreview(watch("subject_template") || "")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Body</p>
                <ScrollArea className="h-[400px] border rounded-md p-4 bg-background">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderPreview(watch("body_template") || "") }}
                  />
                </ScrollArea>
              </div>
              <p className="text-xs text-muted-foreground italic">
                This preview uses sample data. Actual values will come from the offer details.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
          {templateId ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
