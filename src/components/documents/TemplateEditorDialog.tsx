import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + tag + content.substring(end);
    setContent(newContent);

    // Set cursor position after the inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSave = () => {
    onSave({
      name,
      category,
      description: description || null,
      content,
      is_active: isActive,
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
            <Label htmlFor="content">Template Content *</Label>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your template content here. Use the smart tags above to insert dynamic fields."
              className="min-h-[300px] font-mono text-sm"
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
