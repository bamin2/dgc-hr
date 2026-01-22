import { useState } from "react";
import { Mail, Loader2, Info, Sparkles, FileText } from "lucide-react";
import { usePayslipEmailTemplate, EmailTemplate, useEmailTemplates } from "@/hooks/useEmailTemplates";
import { EmailTemplateCard } from "@/components/settings/email-templates/EmailTemplateCard";
import { EmailTemplateEditor } from "@/components/settings/email-templates/EmailTemplateEditor";
import { TemplateSourceToggle } from "@/components/settings/email-templates/TemplateSourceToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PayslipEmailTemplateTab() {
  const { template, isLoading, error } = usePayslipEmailTemplate();
  const { updateTemplate } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleToggleDefaultTemplate = (templateId: string, useDefault: boolean) => {
    updateTemplate.mutate({
      id: templateId,
      updates: { use_default_template: useDefault },
    });
  };

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
        <p className="text-destructive">Failed to load email template</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Payslip email template not configured</p>
        <p className="text-sm text-muted-foreground mt-1">
          Contact your administrator to set up the payslip email template.
        </p>
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
            <h2 className="text-lg font-semibold">Payslip Email Notification</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure the email sent to employees when their payslip is issued
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How Payslip Emails Work</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span><strong>Trigger:</strong> When payslips are generated and sent from a payroll run</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  <span><strong>Recipient:</strong> Each employee receives their individual payslip email</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span><strong>Content:</strong> Includes pay period, net pay summary, and portal link</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
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
            {/* Template Source Toggle */}
            <div className="p-4">
              <TemplateSourceToggle
                useDefault={template.use_default_template}
                onChange={(useDefault) => handleToggleDefaultTemplate(template.id, useDefault)}
                disabled={updateTemplate.isPending}
              />
              {template.use_default_template && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Using DGC-branded template</span>
                </div>
              )}
            </div>

            {/* Trigger Info & Edit */}
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Trigger</h4>
                <p className="text-sm text-muted-foreground">When payslips are issued from a payroll run</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Primary Recipient</h4>
                <p className="text-sm text-muted-foreground">Each employee in the payroll run</p>
              </div>
              {!template.use_default_template && (
                <EmailTemplateCard 
                  template={template} 
                  onEdit={() => setSelectedTemplate(template)}
                  compact
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Tags Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Available Smart Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-muted-foreground mb-2">Employee</h5>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">{"{{employee.first_name}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{employee.last_name}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{employee.full_name}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{employee.email}}"}</code></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-muted-foreground mb-2">Payroll</h5>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">{"{{payroll.pay_period}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{payroll.net_pay}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{payroll.gross_pay}}"}</code></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-muted-foreground mb-2">Company</h5>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">{"{{company.name}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{company.email}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{company.website}}"}</code></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-muted-foreground mb-2">System</h5>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">{"{{system.current_date}}"}</code></li>
                <li><code className="bg-muted px-1 rounded">{"{{system.portal_link}}"}</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
