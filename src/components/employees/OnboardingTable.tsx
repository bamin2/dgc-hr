import { useNavigate } from "react-router-dom";
import { Trash2, Edit, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnboardingStatusBadge } from "./OnboardingStatusBadge";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingRecord, OnboardingTask, calculateOnboardingProgress } from "@/hooks/useOnboarding";
import { formatDisplayDate } from "@/lib/dateUtils";

interface OnboardingTableProps {
  records: OnboardingRecord[];
  selectedRecords: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit?: (record: OnboardingRecord) => void;
  onDelete?: (record: OnboardingRecord) => void;
}

export function OnboardingTable({
  records,
  selectedRecords,
  onSelectionChange,
  onEdit,
  onDelete,
}: OnboardingTableProps) {
  const navigate = useNavigate();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(records.map((r) => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (recordId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRecords, recordId]);
    } else {
      onSelectionChange(selectedRecords.filter((id) => id !== recordId));
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatDisplayDate(dateString) || dateString;
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={
                  records.length > 0 && selectedRecords.length === records.length
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Employee Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Scheduled Completion</TableHead>
            <TableHead>Completed On</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const progress = record.tasks ? calculateOnboardingProgress(record.tasks) : 0;
            const employeeName = record.employee
              ? `${record.employee.first_name} ${record.employee.last_name}`
              : "Unknown Employee";
            
            return (
              <TableRow key={record.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(record.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/employees/onboarding/${record.id}`)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={record.employee?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {record.employee
                          ? getInitials(record.employee.first_name, record.employee.last_name)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground hover:text-primary">
                      {employeeName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.start_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {record.workflow_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.scheduled_completion)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.completed_on)}
                </TableCell>
                <TableCell>
                  <OnboardingProgress value={progress} />
                </TableCell>
                <TableCell>
                  <OnboardingStatusBadge status={record.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(record)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit?.(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/employees/onboarding/${record.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Reset Progress</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
