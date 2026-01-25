import { useState } from "react";
import { ResponsiveDialog, ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
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
import { useMyEmployee } from "@/hooks/useMyEmployee";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RequestHRDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestHRDocumentDialog({ open, onOpenChange }: RequestHRDocumentDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: templates, isLoading: templatesLoading } = useRequestableTemplates();
  const createRequest = useCreateHRDocumentRequest();

  const handleSubmit = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a document type");
      return;
    }

    if (!employee?.id) {
      toast.error("Unable to identify your employee profile");
      return;
    }

    try {
      await createRequest.mutateAsync({
        employeeId: employee.id,
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

  const isLoading = templatesLoading || employeeLoading;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request HR Document"
      description="Select the type of document you need and provide any additional notes."
      size="md"
      footer={
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTemplateId || createRequest.isPending || !employee?.id}
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
        </ResponsiveDialogFooter>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type *</Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available documents...
            </div>
          ) : templates && templates.length > 0 ? (
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="document-type" className="h-12 sm:h-10">
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
            className="min-h-[100px]"
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
