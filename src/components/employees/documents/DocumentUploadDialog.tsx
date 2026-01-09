import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpiryNotificationSettings } from "./ExpiryNotificationSettings";
import {
  useDocumentTypes,
  useUploadDocument,
} from "@/hooks/useEmployeeDocuments";
import { toast } from "@/hooks/use-toast";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  employeeId,
}: DocumentUploadDialogProps) {
  const { data: documentTypes = [] } = useDocumentTypes();
  const uploadDocument = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [notifications, setNotifications] = useState({
    daysBeforeExpiry: 30,
    notifyEmployee: true,
    notifyManager: true,
    notifyHr: true,
  });

  const selectedType = documentTypes.find((t) => t.id === documentTypeId);
  const requiresExpiry = selectedType?.requiresExpiry ?? false;

  const resetForm = () => {
    setFile(null);
    setDocumentTypeId("");
    setDocumentName("");
    setDocumentNumber("");
    setIssueDate("");
    setExpiryDate("");
    setNotes("");
    setNotifications({
      daysBeforeExpiry: 30,
      notifyEmployee: true,
      notifyManager: true,
      notifyHr: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !documentTypeId || !documentName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (requiresExpiry && !expiryDate) {
      toast({
        title: "Expiry date required",
        description: "This document type requires an expiry date",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        employeeId,
        documentTypeId,
        documentName,
        file,
        expiryDate: expiryDate || null,
        issueDate: issueDate || null,
        documentNumber: documentNumber || null,
        notes: notes || null,
        notifications: expiryDate ? notifications : undefined,
      });

      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type */}
          <div className="space-y-2">
            <Label>
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              File <span className="text-destructive">*</span>
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            {!file ? (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG, DOC up to 10MB
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label>
              Document Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., National ID Card"
            />
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label>Document Number</Label>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g., CPR-123456789"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Expiry Date{" "}
                {requiresExpiry && <span className="text-destructive">*</span>}
              </Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Notification Settings (only if expiry date is set) */}
          {expiryDate && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Expiry Notifications</h4>
                <ExpiryNotificationSettings
                  value={notifications}
                  onChange={setNotifications}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploadDocument.isPending}
          >
            {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
