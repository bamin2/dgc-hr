import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { SmartTag, SmartTagInsert } from "@/hooks/useSmartTags";
import { SOURCE_FIELDS, getFieldsForSource } from "@/data/smartTagFields";

const SOURCE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "company", label: "Company" },
  { value: "position", label: "Position" },
  { value: "department", label: "Department" },
  { value: "work_location", label: "Work Location" },
  { value: "manager", label: "Manager" },
  { value: "system", label: "System" },
];

const DEFAULT_CATEGORIES = [
  "Employee",
  "Employment",
  "Compensation",
  "Company",
  "Signature",
  "Date",
];

interface SmartTagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  smartTag?: SmartTag | null;
  onSave: (data: SmartTagInsert) => void;
  isLoading?: boolean;
  existingCategories?: string[];
}

export function SmartTagFormDialog({
  open,
  onOpenChange,
  smartTag,
  onSave,
  isLoading,
  existingCategories = [],
}: SmartTagFormDialogProps) {
  const [tagName, setTagName] = useState("");
  const [field, setField] = useState("");
  const [source, setSource] = useState("employee");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [useNewCategory, setUseNewCategory] = useState(false);

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])];
  const availableFields = getFieldsForSource(source);
  const selectedField = availableFields.find(f => f.field === field);

  useEffect(() => {
    if (open) {
      if (smartTag) {
        // Remove << >> from tag for editing
        const cleanTag = smartTag.tag.replace(/^<<|>>$/g, "");
        setTagName(cleanTag);
        setField(smartTag.field);
        setSource(smartTag.source);
        setCategory(smartTag.category);
        setDescription(smartTag.description);
        setIsActive(smartTag.is_active);
        setUseNewCategory(false);
        setNewCategory("");
      } else {
        setTagName("");
        setField("");
        setSource("employee");
        setCategory("");
        setDescription("");
        setIsActive(true);
        setUseNewCategory(false);
        setNewCategory("");
      }
    }
  }, [open, smartTag]);

  // Reset field when source changes (only for new tags)
  useEffect(() => {
    if (!smartTag && open) {
      setField("");
    }
  }, [source, smartTag, open]);

  // Auto-populate description when field is selected
  useEffect(() => {
    if (selectedField && !smartTag && !description) {
      setDescription(selectedField.description);
    }
  }, [selectedField, smartTag, description]);

  const formattedTag = tagName ? `<<${tagName}>>` : "";
  const finalCategory = useNewCategory ? newCategory : category;
  const isValid = tagName && field && source && finalCategory && description;

  const handleSave = () => {
    if (!isValid) return;

    onSave({
      tag: formattedTag,
      field,
      source,
      category: finalCategory,
      description,
      is_system: smartTag?.is_system ?? false,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {smartTag ? "Edit Smart Tag" : "Add Smart Tag"}
          </DialogTitle>
          <DialogDescription>
            {smartTag
              ? "Modify the smart tag details below."
              : "Create a new smart tag for use in document templates."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tagName">Tag Name *</Label>
            <Input
              id="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="e.g., First Name"
            />
            {tagName && (
              <p className="text-xs text-muted-foreground">
                Will be formatted as: <code className="bg-muted px-1 rounded">{formattedTag}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Data Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Database Field *</Label>
            <Select value={field} onValueChange={setField} disabled={!source}>
              <SelectTrigger>
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((f) => (
                  <SelectItem key={f.field} value={f.field}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedField && (
              <p className="text-xs text-muted-foreground">
                {selectedField.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <div className="flex items-center gap-2 mb-2">
              <Switch
                id="newCategory"
                checked={useNewCategory}
                onCheckedChange={setUseNewCategory}
              />
              <Label htmlFor="newCategory" className="text-sm font-normal">
                Create new category
              </Label>
            </div>
            {useNewCategory ? (
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
              />
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this tag represents"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isLoading}>
            {isLoading ? "Saving..." : smartTag ? "Save Changes" : "Add Smart Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
