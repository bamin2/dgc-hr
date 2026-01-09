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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartTagsPanel } from "./SmartTagsPanel";
import { templateCategories } from "./TemplateCategoryBadge";
import { DocumentTemplate, DocumentTemplateInput } from "@/hooks/useDocumentTemplates";
import { RichTextEditor, insertIntoRichTextEditor } from "./RichTextEditor";
import { FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [docxTemplateUrl, setDocxTemplateUrl] = useState<string | null>(null);
  const [isUploadingDocx, setIsUploadingDocx] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setDescription(template.description || "");
      setContent(template.content);
      setIsActive(template.is_active);
      setAvailableForRequest(template.available_for_request ?? false);
      setDocxTemplateUrl(template.docx_template_url);
    } else {
      setName("");
      setCategory("offer_letter");
      setDescription("");
      setContent("");
      setIsActive(true);
      setAvailableForRequest(false);
      setDocxTemplateUrl(null);
    }
  }, [template, open]);

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('Please upload a .docx file');
      return;
    }

    setIsUploadingDocx(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('docx-templates')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('docx-templates')
        .getPublicUrl(data.path);

      setDocxTemplateUrl(urlData.publicUrl);
      toast.success('DOCX template uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload template');
    } finally {
      setIsUploadingDocx(false);
    }
  };

  const handleInsertTag = (tag: string) => {
    insertIntoRichTextEditor(tag);
  };

  const handleSave = () => {
    onSave({
      name,
      category,
      description: description || null,
      content,
      is_active: isActive,
      available_for_request: availableForRequest,
      docx_template_url: docxTemplateUrl,
    });
  };

  const isValid = name.trim() && content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                placeholder="e.g., Offer Letter - Standard"
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

          <SmartTagsPanel onInsertTag={handleInsertTag} />

          <div className="space-y-2">
            <Label>Template Content *</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
            />
          </div>

          <div className="flex flex-col gap-3">
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

          <div className="space-y-2 pt-4 border-t">
            <Label>Word Template (.docx)</Label>
            <p className="text-sm text-muted-foreground">
              Upload a .docx file using the same smart tags as HTML templates (e.g., <code className="bg-muted px-1 rounded">{"<<First Name>>"}</code>, <code className="bg-muted px-1 rounded">{"<<Company Name>>"}</code>).
              Make sure tags are typed as continuous text without styling changes inside.
            </p>

            {docxTemplateUrl ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm flex-1 truncate">
                  {docxTemplateUrl.split('/').pop()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocxTemplateUrl(null)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxUpload}
                  disabled={isUploadingDocx}
                  className="cursor-pointer"
                />
                {isUploadingDocx && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            )}
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
