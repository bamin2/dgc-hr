import { format } from "date-fns";
import { Mail, CheckCircle, XCircle, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailTemplate } from "@/hooks/useEmailTemplates";

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: () => void;
}

const templateIcons: Record<string, string> = {
  leave_request_submitted: "📩",
  leave_request_approved: "✅",
  leave_request_rejected: "❌",
  payslip_issued: "💰",
};

export function EmailTemplateCard({ template, onEdit }: EmailTemplateCardProps) {
  const icon = templateIcons[template.type] || "📧";

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="text-2xl shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{template.name}</h3>
                {template.is_active ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 shrink-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {template.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Subject: <span className="text-foreground">{template.subject}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {format(new Date(template.updated_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
