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

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setDescription(template.description || "");
      setContent(template.content);
      setIsActive(template.is_active);
    } else {
      setName("");
      setCategory("offer_letter");
      setDescription("");
      setContent("");
      setIsActive(true);
    }
  }, [template, open]);

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
      docx_template_url: template?.docx_template_url || null,
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

          <div className="flex items-center gap-2">
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is_active">Active template</Label>
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
