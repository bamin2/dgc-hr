import { format, differenceInDays, isPast, parseISO } from "date-fns";
import {
  IdCard,
  FileText,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeDocument } from "@/hooks/useEmployeeDocuments";

interface DocumentCardProps {
  document: EmployeeDocument;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  canEdit: boolean;
}

const documentIcons: Record<string, React.ReactNode> = {
  "ID Card": <IdCard className="h-5 w-5" />,
  Passport: <span className="text-lg">🛂</span>,
  "Work Visa": <span className="text-lg">📋</span>,
  "Employment Contract": <FileText className="h-5 w-5" />,
  "Offer Letter": <FileText className="h-5 w-5" />,
  "Educational Certificate": <span className="text-lg">🎓</span>,
  "Professional License": <span className="text-lg">📜</span>,
  "Medical Certificate": <span className="text-lg">🏥</span>,
  "Driving License": <span className="text-lg">🚗</span>,
};

function getExpiryStatus(expiryDate: string | null): {
  label: string;
  variant: "destructive" | "warning" | "success" | "secondary";
  daysText: string | null;
} {
  if (!expiryDate) {
    return { label: "No expiry", variant: "secondary", daysText: null };
  }

  const expiry = parseISO(expiryDate);
  const today = new Date();
  const daysUntil = differenceInDays(expiry, today);

  if (isPast(expiry)) {
    return {
      label: "Expired",
      variant: "destructive",
      daysText: `${Math.abs(daysUntil)} days ago`,
    };
  }

  if (daysUntil <= 30) {
    return {
      label: "Expiring soon",
      variant: "warning",
      daysText: `in ${daysUntil} days`,
    };
  }

  return {
    label: "Valid",
    variant: "success",
    daysText: daysUntil > 365 ? `${Math.floor(daysUntil / 365)}+ years` : `${daysUntil} days`,
  };
}

export function DocumentCard({
  document,
  onView,
  onEdit,
  onDelete,
  onDownload,
  canEdit,
}: DocumentCardProps) {
  const icon = documentIcons[document.documentTypeName] || (
    <FileText className="h-5 w-5" />
  );
  const expiryStatus = getExpiryStatus(document.expiryDate);

  const notificationRecipients: string[] = [];
  if (document.notifications) {
    if (document.notifications.notifyEmployee) notificationRecipients.push("Employee");
    if (document.notifications.notifyManager) notificationRecipients.push("Manager");
    if (document.notifications.notifyHr) notificationRecipients.push("HR");
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">
                  {document.documentTypeName}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground truncate mb-2">
                {document.documentNumber || document.documentName}
              </p>

              {/* Expiry info */}
              <div className="flex items-center gap-2 flex-wrap">
                {document.expiryDate && (
                  <span className="text-xs text-muted-foreground">
                    Expires: {format(parseISO(document.expiryDate), "MMM d, yyyy")}
                  </span>
                )}
                <Badge
                  variant={
                    expiryStatus.variant === "success"
                      ? "default"
                      : expiryStatus.variant === "warning"
                      ? "secondary"
                      : expiryStatus.variant === "destructive"
                      ? "destructive"
                      : "outline"
                  }
                  className={
                    expiryStatus.variant === "success"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : expiryStatus.variant === "warning"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      : ""
                  }
                >
                  {expiryStatus.label}
                  {expiryStatus.daysText && ` • ${expiryStatus.daysText}`}
                </Badge>
              </div>

              {/* Notification info */}
              {notificationRecipients.length > 0 && document.expiryDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Bell className="h-3 w-3" />
                  <span>
                    {notificationRecipients.join(", ")} •{" "}
                    {document.notifications?.daysBeforeExpiry} days before
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
