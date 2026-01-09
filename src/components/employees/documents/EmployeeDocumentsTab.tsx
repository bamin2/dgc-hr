import { useState } from "react";
import { Plus, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { DocumentCard } from "./DocumentCard";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { DocumentViewDialog } from "./DocumentViewDialog";
import { DocumentEditDialog } from "./DocumentEditDialog";
import {
  useEmployeeDocuments,
  useDocumentTypes,
  useDeleteDocument,
  useGetDocumentUrl,
  EmployeeDocument,
} from "@/hooks/useEmployeeDocuments";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeDocumentsTabProps {
  employeeId: string;
  canEdit: boolean;
}

type ExpiryFilter = "all" | "valid" | "expiring" | "expired";

export function EmployeeDocumentsTab({
  employeeId,
  canEdit,
}: EmployeeDocumentsTabProps) {
  const { data: documents = [], isLoading } = useEmployeeDocuments(employeeId);
  const { data: documentTypes = [] } = useDocumentTypes();
  const deleteDocument = useDeleteDocument();
  const getDocumentUrl = useGetDocumentUrl();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<EmployeeDocument | null>(null);
  const [editDocument, setEditDocument] = useState<EmployeeDocument | null>(null);
  const [deleteConfirmDocument, setDeleteConfirmDocument] = useState<EmployeeDocument | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Type filter
    if (typeFilter !== "all" && doc.documentTypeId !== typeFilter) {
      return false;
    }

    // Expiry filter
    if (expiryFilter !== "all" && doc.expiryDate) {
      const today = new Date();
      const expiry = new Date(doc.expiryDate);
      const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (expiryFilter === "expired" && daysUntil >= 0) return false;
      if (expiryFilter === "expiring" && (daysUntil < 0 || daysUntil > 30)) return false;
      if (expiryFilter === "valid" && daysUntil <= 30) return false;
    } else if (expiryFilter !== "all" && !doc.expiryDate) {
      // Documents without expiry date
      if (expiryFilter !== "valid") return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.documentName.toLowerCase().includes(query) ||
        doc.documentTypeName.toLowerCase().includes(query) ||
        doc.documentNumber?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleDelete = async () => {
    if (!deleteConfirmDocument) return;

    try {
      await deleteDocument.mutateAsync({
        id: deleteConfirmDocument.id,
        employeeId: deleteConfirmDocument.employeeId,
        fileUrl: deleteConfirmDocument.fileUrl,
      });

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmDocument(null);
    }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const signedUrl = await getDocumentUrl.mutateAsync(doc.fileUrl);
      const link = window.document.createElement("a");
      link.href = signedUrl;
      link.download = doc.fileName;
      link.click();
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Employee Documents
              </CardTitle>
              <CardDescription>
                Store and manage important employee documents
              </CardDescription>
            </div>
            {canEdit && (
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={expiryFilter} onValueChange={(v) => setExpiryFilter(v as ExpiryFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          {filteredDocuments.length > 0 ? (
            <div className="grid gap-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  canEdit={canEdit}
                  onView={() => setViewDocument(doc)}
                  onEdit={() => setEditDocument(doc)}
                  onDelete={() => setDeleteConfirmDocument(doc)}
                  onDownload={() => handleDownload(doc)}
                />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No documents match your filters</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-1">No documents uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload contracts, certificates, and other important documents
              </p>
              {canEdit && (
                <Button variant="outline" onClick={() => setUploadOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        employeeId={employeeId}
      />

      <DocumentViewDialog
        open={!!viewDocument}
        onOpenChange={(open) => !open && setViewDocument(null)}
        document={viewDocument}
      />

      <DocumentEditDialog
        open={!!editDocument}
        onOpenChange={(open) => !open && setEditDocument(null)}
        document={editDocument}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirmDocument}
        onOpenChange={(open) => !open && setDeleteConfirmDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmDocument?.documentName}"?
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
    </>
  );
}
