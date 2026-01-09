import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequestableTemplates } from "@/hooks/useDocumentTemplates";
import { useCreateHRDocumentRequest } from "@/hooks/useHRDocumentRequests";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

interface RequestHRDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestHRDocumentDialog({ open, onOpenChange }: RequestHRDocumentDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: templates, isLoading: templatesLoading } = useRequestableTemplates();
  const createRequest = useCreateHRDocumentRequest();

  const handleSubmit = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a document type");
      return;
    }

    try {
      await createRequest.mutateAsync({
        templateId: selectedTemplateId,
        notes: notes || undefined,
      });
      toast.success("Document request submitted successfully");
      onOpenChange(false);
      setSelectedTemplateId("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Request HR Document
          </DialogTitle>
          <DialogDescription>
            Select the type of document you need and provide any additional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type *</Label>
            {templatesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available documents...
              </div>
            ) : templates && templates.length > 0 ? (
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Select a document..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents are currently available for request.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information or special requests..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTemplateId || createRequest.isPending}
          >
            {createRequest.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
