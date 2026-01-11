import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfferLetterTemplate, useCreateOfferLetterTemplate, useUpdateOfferLetterTemplate, type TemplateFormData } from "@/hooks/useOfferLetterTemplates";

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
  const { data: template } = useOfferLetterTemplate(templateId || undefined);
  const createTemplate = useCreateOfferLetterTemplate();
  const updateTemplate = useUpdateOfferLetterTemplate();

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
        <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
          {templateId ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
