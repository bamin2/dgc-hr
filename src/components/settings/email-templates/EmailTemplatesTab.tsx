import { useState } from "react";
import { Mail, Loader2, Info } from "lucide-react";
import { useNonLeaveEmailTemplates, EmailTemplate } from "@/hooks/useEmailTemplates";
import { EmailTemplateCard } from "./EmailTemplateCard";
import { EmailTemplateEditor } from "./EmailTemplateEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export function EmailTemplatesTab() {
  const { templates, isLoading, error } = useNonLeaveEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load email templates</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Email Templates</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize the email notifications sent to employees
        </p>
      </div>

      {/* Info about leave and payslip templates */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Leave request</strong> email templates are in{" "}
          <Link 
            to="/time-management?tab=email-templates" 
            className="font-medium text-primary hover:underline"
          >
            Time Management → Email Templates
          </Link>
          . <strong>Payslip</strong> email templates are in{" "}
          <Link 
            to="/payroll/templates?tab=email" 
            className="font-medium text-primary hover:underline"
          >
            Payroll → Payslip Templates
          </Link>
          .
        </AlertDescription>
      </Alert>

      {/* Template List */}
      <div className="grid gap-4">
        {templates?.map((template) => (
          <EmailTemplateCard
            key={template.id}
            template={template}
            onEdit={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      {/* Empty State */}
      {templates?.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No email templates found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Leave email templates are available in Time Management
          </p>
        </div>
      )}

      {/* Editor Dialog */}
      {selectedTemplate && (
        <EmailTemplateEditor
          template={selectedTemplate}
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
