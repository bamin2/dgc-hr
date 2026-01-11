import { useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Eye, Upload, FileText, X, FileType, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOfferLetterTemplate, useCreateOfferLetterTemplate, useUpdateOfferLetterTemplate, useUploadDocxTemplate, type TemplateFormData } from "@/hooks/useOfferLetterTemplates";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useActiveSmartTags } from "@/hooks/useSmartTags";
import { toast } from "sonner";

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
  const { data: smartTags, isLoading: tagsLoading } = useActiveSmartTags();
  const createTemplate = useCreateOfferLetterTemplate();
  const updateTemplate = useUpdateOfferLetterTemplate();
  const uploadDocx = useUploadDocxTemplate();
  const [showPreview, setShowPreview] = useState(false);
  const [templateType, setTemplateType] = useState<'html' | 'docx'>('html');
  const [docxFile, setDocxFile] = useState<{ url: string; name: string } | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group smart tags by category for display
  const groupedTags = useMemo(() => {
    if (!smartTags) return {};
    const groups: Record<string, typeof smartTags> = {};
    smartTags.forEach(tag => {
      if (!groups[tag.category]) groups[tag.category] = [];
      groups[tag.category].push(tag);
    });
    return groups;
  }, [smartTags]);

  const handleCopyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 2000);
    } catch (err) {
      toast.error("Failed to copy tag");
    }
  };

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
      template_type: 'html',
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        template_name: template.template_name,
        description: template.description || "",
        subject_template: template.subject_template || "",
        body_template: template.body_template || "",
        is_active: template.is_active,
        template_type: template.template_type || 'html',
      });
      setTemplateType(template.template_type || 'html');
      if (template.docx_template_url && template.docx_original_filename) {
        setDocxFile({ url: template.docx_template_url, name: template.docx_original_filename });
      }
    }
  }, [template, reset]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error("Please upload a .docx file");
      return;
    }

    try {
      const result = await uploadDocx.mutateAsync(file);
      setDocxFile({ url: result.url, name: result.originalName });
      setValue('docx_template_url', result.url);
      setValue('docx_original_filename', result.originalName);
      toast.success("Template uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleRemoveDocx = () => {
    setDocxFile(null);
    setValue('docx_template_url', null);
    setValue('docx_original_filename', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    const submitData: TemplateFormData = {
      ...data,
      template_type: templateType,
    };

    if (templateType === 'docx') {
      if (!docxFile) {
        toast.error("Please upload a Word document template");
        return;
      }
      submitData.docx_template_url = docxFile.url;
      submitData.docx_original_filename = docxFile.name;
      // Clear HTML fields for DOCX templates
      submitData.body_template = "";
    } else {
      // Clear DOCX fields for HTML templates
      submitData.docx_template_url = null;
      submitData.docx_original_filename = null;
    }

    if (templateId) {
      await updateTemplate.mutateAsync({ id: templateId, data: submitData });
    } else {
      await createTemplate.mutateAsync(submitData);
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

        {/* Template Type Selection */}
        <div className="space-y-3">
          <Label>Template Type</Label>
          <RadioGroup
            value={templateType}
            onValueChange={(v) => setTemplateType(v as 'html' | 'docx')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="html" id="html" />
              <Label htmlFor="html" className="font-normal cursor-pointer">HTML Template</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="docx" id="docx" />
              <Label htmlFor="docx" className="font-normal cursor-pointer">Word Document</Label>
            </div>
          </RadioGroup>
        </div>

        {templateType === 'html' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject_template">Email Subject</Label>
              <Input id="subject_template" {...register("subject_template")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_template">Email Body (HTML)</Label>
              <Textarea id="body_template" {...register("body_template")} rows={12} className="font-mono text-sm" />
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
          </>
        ) : (
          <>
            {/* DOCX Upload Section */}
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!docxFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Word Document Template</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to browse or drag and drop a .docx file</p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileType className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{docxFile.name}</p>
                      <p className="text-xs text-muted-foreground">Word Document Template</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDocx}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject_template">Email Subject (for the email containing the PDF)</Label>
                <Input id="subject_template" {...register("subject_template")} placeholder="Offer Letter - Your Position at Company" />
              </div>
            </div>

            {/* Smart Tags Reference for DOCX */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Available Smart Tags for Word Document
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Use these tags in your Word document. They will be replaced with actual values when the offer letter is generated.
                </p>
                {tagsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading smart tags...</p>
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-4">
                      {Object.entries(groupedTags).map(([category, tags]) => (
                        <div key={category} className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</p>
                          <div className="space-y-1">
                            {tags.map((tag) => (
                              <div key={tag.id} className="flex items-center gap-2 group">
                                <code className="bg-muted px-2 py-1 rounded font-mono text-xs whitespace-nowrap">
                                  {tag.tag}
                                </code>
                                <span className="text-xs text-muted-foreground flex-1">{tag.description}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleCopyTag(tag.tag)}
                                >
                                  {copiedTag === tag.tag ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                <p className="text-xs text-muted-foreground mt-3 italic">
                  When sent, the document will be converted to PDF so the recipient cannot edit it.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {templateType === 'html' && (
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
        )}
        <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending || uploadDocx.isPending}>
          {templateId ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
