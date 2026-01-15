import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayslipTemplate, useCreatePayslipTemplate, useUpdatePayslipTemplate } from "@/hooks/usePayslipTemplates";
import { TemplateFileTab } from "@/components/payroll/templates/TemplateFileTab";
import { TemplateSettingsTab } from "@/components/payroll/templates/TemplateSettingsTab";
import { SmartTagsTab } from "@/components/payroll/templates/SmartTagsTab";
import { TemplatePreviewTab } from "@/components/payroll/templates/TemplatePreviewTab";
import type { PayslipTemplateSettings, PayslipTemplateInsert, PayslipTemplateUpdate } from "@/types/payslip-template";
import { DEFAULT_PAYSLIP_TEMPLATE_SETTINGS } from "@/types/payslip-template";

export default function PayslipTemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const { data: template, isLoading } = usePayslipTemplate(isNew ? undefined : id);
  const createMutation = useCreatePayslipTemplate();
  const updateMutation = useUpdatePayslipTemplate();

  const [activeTab, setActiveTab] = useState("file");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docxStoragePath, setDocxStoragePath] = useState("");
  const [originalFilename, setOriginalFilename] = useState("");
  const [settings, setSettings] = useState<PayslipTemplateSettings>(DEFAULT_PAYSLIP_TEMPLATE_SETTINGS);
  const [workLocationId, setWorkLocationId] = useState<string | null>(null);

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setDocxStoragePath(template.docx_storage_path);
      setOriginalFilename(template.original_filename || "");
      setSettings(template.settings);
      setWorkLocationId(template.work_location_id);
    }
  }, [template]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    if (isNew) {
      if (!docxStoragePath) {
        return;
      }
      const data: PayslipTemplateInsert = {
        name: name.trim(),
        description: description.trim() || null,
        docx_storage_path: docxStoragePath,
        original_filename: originalFilename || null,
        settings,
        work_location_id: workLocationId,
      };
      createMutation.mutate(data, {
        onSuccess: (result) => {
          navigate(`/payroll/templates/${result.id}`);
        },
      });
    } else {
      const updates: PayslipTemplateUpdate = {
        name: name.trim(),
        description: description.trim() || null,
        settings,
        work_location_id: workLocationId,
      };
      if (docxStoragePath && docxStoragePath !== template?.docx_storage_path) {
        updates.docx_storage_path = docxStoragePath;
        updates.original_filename = originalFilename || null;
      }
      updateMutation.mutate({ id: id!, updates });
    }
  };

  const handleFileUploaded = (path: string, filename: string) => {
    setDocxStoragePath(path);
    setOriginalFilename(filename);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canSave = name.trim() && (isNew ? docxStoragePath : true);

  if (!isNew && isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/payroll/templates")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNew ? "New Payslip Template" : "Edit Template"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isNew
                  ? "Upload a DOCX template and configure settings"
                  : template?.name || "Loading..."}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isNew ? "Create Template" : "Save Changes"}
          </Button>
        </div>

        {/* Name & Description */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Payslip Template"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={1}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="file">Template File</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="tags">Smart Tags</TabsTrigger>
            <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6">
            <TemplateFileTab
              docxStoragePath={docxStoragePath}
              originalFilename={originalFilename}
              onFileUploaded={handleFileUploaded}
              workLocationId={workLocationId}
              onWorkLocationChange={setWorkLocationId}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <TemplateSettingsTab
              settings={settings}
              onSettingsChange={setSettings}
            />
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <SmartTagsTab docxStoragePath={docxStoragePath} />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <TemplatePreviewTab
              settings={settings}
              docxStoragePath={docxStoragePath}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
