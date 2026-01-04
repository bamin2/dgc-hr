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
import { OnboardingRecord } from "@/data/onboarding";
import { OnboardingStatusBadge } from "./OnboardingStatusBadge";
import { OnboardingProgress } from "./OnboardingProgress";

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
            <TableHead>Scheduled On</TableHead>
            <TableHead>Completed On</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={record.employeeAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(record.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {record.employeeName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.startDate}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.workflow}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.scheduledOn}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.completedOn || '-'}
              </TableCell>
              <TableCell>
                <OnboardingProgress value={record.progress} />
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                      <DropdownMenuItem>Reset Progress</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
