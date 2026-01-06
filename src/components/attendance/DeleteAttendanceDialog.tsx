import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { AttendanceRecord, useDeleteAttendanceRecord } from '@/hooks/useAttendanceRecords';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface DeleteAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

export function DeleteAttendanceDialog({
  open,
  onOpenChange,
  record,
}: DeleteAttendanceDialogProps) {
  const deleteMutation = useDeleteAttendanceRecord();

  if (!record) return null;

  const employee = record.employee;
  const formattedDate = new Date(record.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(record.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </p>

            {employee && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={employee.avatar_url || undefined}
                    alt={`${employee.first_name} ${employee.last_name}`}
                  />
                  <AvatarFallback>
                    {employee.first_name[0]}
                    {employee.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
                <AttendanceStatusBadge status={record.status} />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Record
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
