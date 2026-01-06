import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Search, Plus, Pencil, Trash2, Lock, Copy } from "lucide-react";
import { SmartTagFormDialog } from "./SmartTagFormDialog";
import {
  useSmartTags,
  useCreateSmartTag,
  useUpdateSmartTag,
  useDeleteSmartTag,
  SmartTag,
  SmartTagInsert,
} from "@/hooks/useSmartTags";
import { toast } from "sonner";

export function SmartTagsTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<SmartTag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<SmartTag | null>(null);

  const { data: smartTags, isLoading } = useSmartTags();
  const createMutation = useCreateSmartTag();
  const updateMutation = useUpdateSmartTag();
  const deleteMutation = useDeleteSmartTag();

  const categories = useMemo(() => {
    if (!smartTags) return [];
    return [...new Set(smartTags.map((t) => t.category))];
  }, [smartTags]);

  const filteredTags = useMemo(() => {
    if (!smartTags) return [];
    return smartTags.filter((tag) => {
      const matchesSearch =
        search === "" ||
        tag.tag.toLowerCase().includes(search.toLowerCase()) ||
        tag.field.toLowerCase().includes(search.toLowerCase()) ||
        tag.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || tag.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [smartTags, search, categoryFilter]);

  const groupedTags = useMemo(() => {
    const groups: Record<string, SmartTag[]> = {};
    filteredTags.forEach((tag) => {
      if (!groups[tag.category]) {
        groups[tag.category] = [];
      }
      groups[tag.category].push(tag);
    });
    return groups;
  }, [filteredTags]);

  const handleCreate = () => {
    setSelectedTag(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tag: SmartTag) => {
    setSelectedTag(tag);
    setIsFormOpen(true);
  };

  const handleSave = (data: SmartTagInsert) => {
    if (selectedTag) {
      updateMutation.mutate(
        { id: selectedTag.id, updates: data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (tagToDelete) {
      deleteMutation.mutate(tagToDelete.id, {
        onSuccess: () => setTagToDelete(null),
      });
    }
  };

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast.success("Tag copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading smart tags...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
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
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Smart Tag
        </Button>
      </div>

      {/* Tags grouped by category */}
      {Object.keys(groupedTags).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No smart tags found.</p>
          <Button variant="outline" className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first smart tag
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTags).map(([category, tags]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}{" "}
                <span className="font-normal">({tags.length} tags)</span>
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Tag</TableHead>
                      <TableHead className="w-[150px]">Field</TableHead>
                      <TableHead className="w-[120px]">Source</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">
                              {tag.tag}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(tag.tag)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {tag.field}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {tag.source.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tag.description}
                        </TableCell>
                        <TableCell>
                          {tag.is_active ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(tag)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {tag.is_system ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled
                                title="System tags cannot be deleted"
                              >
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setTagToDelete(tag)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <SmartTagFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        smartTag={selectedTag}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
        existingCategories={categories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Smart Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag{" "}
              <code className="bg-muted px-1 rounded">{tagToDelete?.tag}</code>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
