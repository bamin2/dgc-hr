import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartTagsPanel } from "./SmartTagsPanel";
import { templateCategories } from "./TemplateCategoryBadge";
import { DocumentTemplate, DocumentTemplateInput, ApprovalMode } from "@/hooks/useDocumentTemplates";
import { RichTextEditor, insertIntoRichTextEditor } from "./RichTextEditor";
import { FileText, X, Loader2, Upload, Download, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: DocumentTemplate | null;
  onSave: (template: DocumentTemplateInput) => void;
  isLoading?: boolean;
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
  isLoading,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("offer_letter");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [availableForRequest, setAvailableForRequest] = useState(false);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("hr_approval");
  
  // Legacy DOCX URL (public bucket)
  const [docxTemplateUrl, setDocxTemplateUrl] = useState<string | null>(null);
  
  // New DOCX storage (private bucket)
  const [docxStoragePath, setDocxStoragePath] = useState<string | null>(null);
  const [docxOriginalFilename, setDocxOriginalFilename] = useState<string | null>(null);
  
  const [isUploadingDocx, setIsUploadingDocx] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("docx");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setDescription(template.description || "");
      setContent(template.content);
      setIsActive(template.is_active);
      setAvailableForRequest(template.available_for_request ?? false);
      setApprovalMode(template.approval_mode || "hr_approval");
      setDocxTemplateUrl(template.docx_template_url);
      setDocxStoragePath(template.docx_storage_path);
      setDocxOriginalFilename(template.docx_original_filename);
      
      // Set active tab based on what's available
      if (template.docx_storage_path || template.docx_template_url) {
        setActiveTab("docx");
      } else if (template.content) {
        setActiveTab("html");
      }
    } else {
      setName("");
      setCategory("offer_letter");
      setDescription("");
      setContent("");
      setIsActive(true);
      setAvailableForRequest(false);
      setApprovalMode("hr_approval");
      setDocxTemplateUrl(null);
      setDocxStoragePath(null);
      setDocxOriginalFilename(null);
      setActiveTab("docx");
    }
  }, [template, open]);

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('Please upload a .docx file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploadingDocx(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('docx-templates')
        .upload(fileName, file);

      if (error) throw error;

      setDocxStoragePath(data.path);
      setDocxOriginalFilename(file.name);
      // Clear legacy URL if we're using the new storage
      setDocxTemplateUrl(null);
      toast.success('DOCX template uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload template');
    } finally {
      setIsUploadingDocx(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!docxStoragePath) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('docx-templates')
        .download(docxStoragePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = docxOriginalFilename || 'template.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleRemoveDocx = () => {
    setDocxStoragePath(null);
    setDocxOriginalFilename(null);
    setDocxTemplateUrl(null);
  };

  const handleInsertTag = (tag: string) => {
    insertIntoRichTextEditor(tag);
  };

  const handleSave = () => {
    onSave({
      name,
      category,
      description: description || null,
      content: content || "",
      is_active: isActive,
      available_for_request: availableForRequest,
      approval_mode: approvalMode,
      docx_template_url: docxTemplateUrl,
      docx_storage_path: docxStoragePath,
      docx_original_filename: docxOriginalFilename,
    });
  };

  // Valid if we have name and either DOCX or HTML content
  const hasDocx = docxStoragePath || docxTemplateUrl;
  const hasContent = content.trim();
  const isValid = name.trim() && (hasDocx || hasContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Salary Certificate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="docx">Word Template (.docx)</TabsTrigger>
              <TabsTrigger value="html">HTML Content (Legacy)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="docx" className="space-y-4 mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload a .docx file using smart tags like <code className="bg-muted px-1 rounded">{"<<First Name>>"}</code>, <code className="bg-muted px-1 rounded">{"<<Job Title>>"}</code>, <code className="bg-muted px-1 rounded">{"<<Salary>>"}</code>. 
                  Tags must be typed as continuous text without styling changes inside.
                </AlertDescription>
              </Alert>

              <SmartTagsPanel onInsertTag={(tag) => {
                navigator.clipboard.writeText(tag);
                toast.success(`Copied "${tag}" to clipboard`);
              }} copyMode />

              {hasDocx ? (
                <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
                  <FileText className="h-6 w-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {docxOriginalFilename || docxTemplateUrl?.split('/').pop() || 'Template uploaded'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DOCX template ready for document generation
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {docxStoragePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        type="button"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDocx}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drop your .docx file here or click to browse
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".docx"
                      onChange={handleDocxUpload}
                      disabled={isUploadingDocx}
                      className="cursor-pointer"
                    />
                    {isUploadingDocx && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="html" className="space-y-4 mt-4">
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  HTML templates are legacy. For HR letters that employees can request, 
                  please use DOCX templates which support PDF generation.
                </AlertDescription>
              </Alert>

              <SmartTagsPanel onInsertTag={handleInsertTag} />

              <div className="space-y-2">
                <Label>Template Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Approval Mode - only show if available for request */}
          {availableForRequest && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Approval Mode</Label>
              <RadioGroup 
                value={approvalMode} 
                onValueChange={(value) => setApprovalMode(value as ApprovalMode)}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-start space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="auto_generate" id="auto_generate" className="mt-1" />
                  <div>
                    <Label htmlFor="auto_generate" className="font-medium cursor-pointer">
                      Auto-generate
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Document generated immediately upon request
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="hr_approval" id="hr_approval" className="mt-1" />
                  <div>
                    <Label htmlFor="hr_approval" className="font-medium cursor-pointer">
                      HR Approval
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Requires HR to approve before generation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="admin_approval" id="admin_approval" className="mt-1" />
                  <div>
                    <Label htmlFor="admin_approval" className="font-medium cursor-pointer">
                      Admin Approval
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Requires Admin to approve before generation
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is_active">Active template</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="available_for_request" 
                checked={availableForRequest} 
                onCheckedChange={setAvailableForRequest} 
              />
              <Label htmlFor="available_for_request">
                Available for employee request
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isLoading}>
            {isLoading ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
