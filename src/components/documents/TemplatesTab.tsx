import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateCard } from "./TemplateCard";
import { TemplateEditorDialog } from "./TemplateEditorDialog";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { SmartTagsTab } from "./SmartTagsTab";
import { templateCategories, getCategoryLabel } from "./TemplateCategoryBadge";
import {
  useDocumentTemplates,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
  useDeleteDocumentTemplate,
  DocumentTemplate,
  DocumentTemplateInput,
} from "@/hooks/useDocumentTemplates";
import { Plus, Search, FileText, Tags } from "lucide-react";
import { toast } from "sonner";

export function TemplatesTab() {
  const [activeSubTab, setActiveSubTab] = useState("all-templates");
  const { data: templates, isLoading } = useDocumentTemplates();
  const createMutation = useCreateDocumentTemplate();
  const updateMutation = useUpdateDocumentTemplate();
  const deleteMutation = useDeleteDocumentTemplate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [templates, search, categoryFilter]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, DocumentTemplate[]> = {};
    filteredTemplates.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTemplates]);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handlePreview = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleDelete = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: DocumentTemplateInput) => {
    try {
      if (selectedTemplate) {
        await updateMutation.mutateAsync({ id: selectedTemplate.id, ...data });
        toast.success("Template updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Template created successfully");
      }
      setEditorOpen(false);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteMutation.mutateAsync(selectedTemplate.id);
      toast.success("Template deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="all-templates" className="gap-2">
          <FileText className="h-4 w-4" />
          All Templates
        </TabsTrigger>
        <TabsTrigger value="smart-tags" className="gap-2">
          <Tags className="h-4 w-4" />
          Smart Tags
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all-templates" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-muted-foreground mt-1">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first template to get started"}
            </p>
            {!search && categoryFilter === "all" && (
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h3 className="text-lg font-medium mb-4">
                  {getCategoryLabel(category)} ({categoryTemplates.length})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor Dialog */}
        <TemplateEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          template={selectedTemplate}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Preview Dialog */}
        <TemplatePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be
                undone.
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
      </TabsContent>

      <TabsContent value="smart-tags">
        <SmartTagsTab />
      </TabsContent>
    </Tabs>
  );
}
