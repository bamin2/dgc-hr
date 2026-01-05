import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign, Percent } from "lucide-react";
import { TemplateFormDialog } from "./TemplateFormDialog";
import { 
  useAllowanceTemplates, 
  useCreateAllowanceTemplate, 
  useUpdateAllowanceTemplate,
  useDeleteAllowanceTemplate 
} from "@/hooks/useAllowanceTemplates";
import { AllowanceTemplate } from "@/data/payrollTemplates";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function AllowanceTemplatesSection() {
  const { data: templates, isLoading } = useAllowanceTemplates();
  const createTemplate = useCreateAllowanceTemplate();
  const updateTemplate = useUpdateAllowanceTemplate();
  const deleteTemplate = useDeleteAllowanceTemplate();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AllowanceTemplate | null>(null);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template: AllowanceTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = (template: AllowanceTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedTemplate) {
        await updateTemplate.mutateAsync({ id: selectedTemplate.id, ...data });
        toast.success("Allowance template updated");
      } else {
        await createTemplate.mutateAsync(data);
        toast.success("Allowance template created");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate.mutateAsync(selectedTemplate.id);
      toast.success("Allowance template deleted");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Allowance Templates</CardTitle>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add Allowance
          </Button>
        </CardHeader>
        <CardContent>
          {templates && templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-500/10">
                      {template.amount_type === 'fixed' ? (
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Percent className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        {!template.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                        {template.is_taxable && (
                          <Badge variant="outline" className="text-xs">Taxable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.amount_type === 'fixed' 
                          ? `$${template.amount.toLocaleString()}`
                          : `${template.amount}% of ${template.percentage_of?.replace('_', ' ')}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No allowance templates yet</p>
              <Button variant="link" onClick={handleCreate}>
                Create your first template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="allowance"
        template={selectedTemplate}
        onSave={handleSave}
        isSaving={createTemplate.isPending || updateTemplate.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allowance Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This will also remove it from any employees it's assigned to.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
