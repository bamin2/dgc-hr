import { useState } from "react";
import { Mail, Loader2, Info, Send, UserCheck, Building2 } from "lucide-react";
import { useLeaveEmailTemplates, EmailTemplate } from "@/hooks/useEmailTemplates";
import { EmailTemplateCard } from "@/components/settings/email-templates/EmailTemplateCard";
import { EmailTemplateEditor } from "@/components/settings/email-templates/EmailTemplateEditor";
import { RecipientConfigCard } from "./RecipientConfigCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Maps template type to trigger description */
const triggerDescriptions: Record<string, { trigger: string; recipient: string; icon: string }> = {
  leave_request_submitted: {
    trigger: "When an employee submits a leave request",
    recipient: "Sent to the assigned approver",
    icon: "📩",
  },
  leave_request_approved: {
    trigger: "When a manager approves a leave request",
    recipient: "Sent to the employee who submitted the request",
    icon: "✅",
  },
  leave_request_rejected: {
    trigger: "When a manager rejects a leave request",
    recipient: "Sent to the employee who submitted the request",
    icon: "❌",
  },
};

export function LeaveEmailTemplatesTab() {
  const { templates, isLoading, error } = useLeaveEmailTemplates();
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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Leave Email Templates</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure email notifications for leave requests, approvals, and rejections
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How Leave Emails Work</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  <span><strong>Submitted:</strong> Notifies the approver when an employee requests leave</span>
                </li>
                <li className="flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span><strong>Approved/Rejected:</strong> Notifies the employee of the decision</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span><strong>Additional Recipients:</strong> Optionally copy managers, HR, or custom emails</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template List with Recipient Config */}
      <div className="space-y-6">
        {templates?.map((template) => {
          const info = triggerDescriptions[template.type];
          
          return (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info?.icon || "📧"}</span>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={template.is_active 
                      ? "bg-green-500/10 text-green-600 border-green-200" 
                      : "bg-muted text-muted-foreground"
                    }
                  >
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  {/* Trigger Info & Edit */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Trigger</h4>
                      <p className="text-sm text-muted-foreground">{info?.trigger}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Primary Recipient</h4>
                      <p className="text-sm text-muted-foreground">{info?.recipient}</p>
                    </div>
                    <EmailTemplateCard 
                      template={template} 
                      onEdit={() => setSelectedTemplate(template)}
                      compact
                    />
                  </div>
                  
                  {/* Recipient Configuration */}
                  <div className="p-4">
                    <RecipientConfigCard template={template} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {templates?.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No leave email templates found</p>
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
