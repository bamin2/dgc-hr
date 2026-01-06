import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Calendar, FileText, Eye, EyeOff, Clock, ArrowRight } from "lucide-react";
import { LeaveType, useUpdateLeaveType } from "@/hooks/useLeaveTypes";
import { LeaveTypeFormDialog } from "./LeaveTypeFormDialog";
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

interface LeaveTypeCardProps {
  leaveType: LeaveType & {
    count_weekends?: boolean;
    requires_document?: boolean;
    document_required_after_days?: number | null;
    visible_to_employees?: boolean;
    allow_carryover?: boolean;
    max_carryover_days?: number | null;
    min_days_notice?: number;
    max_consecutive_days?: number | null;
  };
}

export function LeaveTypeCard({ leaveType }: LeaveTypeCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateLeaveType = useUpdateLeaveType();

  const handleToggleActive = () => {
    updateLeaveType.mutate({
      id: leaveType.id,
      is_active: !leaveType.is_active,
    });
  };

  const handleDeactivate = () => {
    updateLeaveType.mutate({
      id: leaveType.id,
      is_active: false,
    });
    setIsDeleteOpen(false);
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Leave type info */}
            <div className="flex items-start gap-3 flex-1">
              <div
                className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: leaveType.color || '#6b7280' }}
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{leaveType.name}</h3>
                  {!leaveType.is_active && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  {leaveType.is_paid && (
                    <Badge variant="outline" className="text-xs text-success border-success/30 bg-success/10">
                      Paid
                    </Badge>
                  )}
                </div>
                {leaveType.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {leaveType.description}
                  </p>
                )}
                
                {/* Policy indicators */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {leaveType.max_days_per_year && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Calendar className="w-3 h-3" />
                      {leaveType.max_days_per_year} days/year
                    </Badge>
                  )}
                  {leaveType.count_weekends === false && (
                    <Badge variant="secondary" className="text-xs">
                      Working days only
                    </Badge>
                  )}
                  {leaveType.count_weekends === true && (
                    <Badge variant="secondary" className="text-xs">
                      Calendar days
                    </Badge>
                  )}
                  {leaveType.requires_document && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <FileText className="w-3 h-3" />
                      Document required
                      {leaveType.document_required_after_days && (
                        <span>({`>${leaveType.document_required_after_days}d`})</span>
                      )}
                    </Badge>
                  )}
                  {leaveType.requires_approval && (
                    <Badge variant="secondary" className="text-xs">
                      Requires approval
                    </Badge>
                  )}
                  {leaveType.min_days_notice && leaveType.min_days_notice > 1 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {leaveType.min_days_notice}d notice
                    </Badge>
                  )}
                  {leaveType.allow_carryover && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Carryover
                      {leaveType.max_carryover_days && (
                        <span>(max {leaveType.max_carryover_days}d)</span>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {leaveType.visible_to_employees ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </div>
              <Switch
                checked={leaveType.is_active}
                onCheckedChange={handleToggleActive}
                disabled={updateLeaveType.isPending}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LeaveTypeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        leaveType={leaveType}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Leave Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{leaveType.name}"? This will hide it from employees but existing records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
