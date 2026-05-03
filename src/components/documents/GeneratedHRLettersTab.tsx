import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useGeneratedHRLetters,
  useDeleteGeneratedHRLetter,
  useGeneratedHRLetterTemplates,
  GeneratedHRLetter,
} from "@/hooks/useGeneratedHRLetters";
import { getCategoryLabel } from "./TemplateCategoryBadge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function GeneratedHRLettersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<GeneratedHRLetter | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: letters, isLoading } = useGeneratedHRLetters(templateFilter, searchQuery);
  const { data: templates } = useGeneratedHRLetterTemplates();
  const deleteLetter = useDeleteGeneratedHRLetter();

  const handleView = async (letter: GeneratedHRLetter) => {
    if (!letter.pdf_storage_path) {
      toast.error("No PDF available");
      return;
    }

    setActionLoading(`view-${letter.id}`);
    try {
      const { data, error } = await supabase.storage
        .from("hr-letters")
        .createSignedUrl(letter.pdf_storage_path, 3600);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error("View error:", error);
      toast.error("Failed to open document");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (letter: GeneratedHRLetter) => {
    if (!letter.pdf_storage_path) {
      toast.error("No PDF available");
      return;
    }

    setActionLoading(`download-${letter.id}`);
    try {
      const { data, error } = await supabase.storage
        .from("hr-letters")
        .download(letter.pdf_storage_path);

      if (error) throw error;

      const employeeName = `${letter.employee?.first_name}_${letter.employee?.last_name}`;
      const templateName = letter.template?.name || "document";
      const fileName = `${templateName}_${employeeName}.pdf`;

      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (letter: GeneratedHRLetter) => {
    setSelectedLetter(letter);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLetter || !selectedLetter.pdf_storage_path) return;

    try {
      await deleteLetter.mutateAsync({
        id: selectedLetter.id,
        storagePath: selectedLetter.pdf_storage_path,
      });
      toast.success("Letter deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedLetter(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete letter");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name, code, or template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templates?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Letters Table */}
      {!letters || letters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No generated letters</h3>
            <p className="text-muted-foreground mt-1">
              Generated HR letters will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={letter.employee?.avatar_url || undefined} />
                        <AvatarFallback>
                          {letter.employee?.first_name?.[0]}
                          {letter.employee?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {letter.employee?.first_name} {letter.employee?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {letter.employee?.employee_code || letter.employee?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{letter.template?.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(letter.template?.category || "")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {letter.processed_at
                      ? format(new Date(letter.processed_at), "MMM d, yyyy 'at' h:mm a")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(letter)}
                        disabled={actionLoading === `view-${letter.id}`}
                        title="View"
                      >
                        {actionLoading === `view-${letter.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(letter)}
                        disabled={actionLoading === `download-${letter.id}`}
                        title="Download"
                      >
                        {actionLoading === `download-${letter.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(letter)}
                        disabled={deleteLetter.isPending}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete HR Letter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this letter for{" "}
              <span className="font-medium">
                {selectedLetter?.employee?.first_name} {selectedLetter?.employee?.last_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLetter.isPending}
            >
              {deleteLetter.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
