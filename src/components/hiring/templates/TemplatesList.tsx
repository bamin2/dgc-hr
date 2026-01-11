import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useOfferLetterTemplates, useDeleteOfferLetterTemplate } from "@/hooks/useOfferLetterTemplates";
import { TemplateEditor } from "./TemplateEditor";

export function TemplatesList() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: templates, isLoading } = useOfferLetterTemplates();
  const deleteTemplate = useDeleteOfferLetterTemplate();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading templates...</p>
      ) : templates?.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No templates found</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <CardDescription className="mt-1">{template.description || "No description"}</CardDescription>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template.id)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteTemplate.mutate(template.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Template" : "Create Template"}</SheetTitle>
          </SheetHeader>
          <TemplateEditor templateId={editingId} onSuccess={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
