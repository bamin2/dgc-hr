import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useLeaveBalanceAdjustments } from "@/hooks/useLeaveBalanceAdjustments";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { format } from "date-fns";

const adjustmentTypeLabels: Record<string, string> = {
  manual: "Manual",
  carryover: "Carryover",
  expiry: "Expiry",
  correction: "Correction",
};

const adjustmentTypeBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  manual: "default",
  carryover: "secondary",
  expiry: "destructive",
  correction: "outline",
};

export function AdjustmentHistoryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");

  const { data: adjustments, isLoading } = useLeaveBalanceAdjustments();
  const { data: leaveTypes } = useLeaveTypes();

  const filteredAdjustments = adjustments?.filter((adj) => {
    const employeeName = adj.employee
      ? `${adj.employee.first_name} ${adj.employee.last_name}`
      : "";
    const matchesSearch =
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeaveType =
      leaveTypeFilter === "all" || adj.leave_type_id === leaveTypeFilter;
    return matchesSearch && matchesLeaveType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Leave Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leave Types</SelectItem>
            {leaveTypes?.map((lt) => (
              <SelectItem key={lt.id} value={lt.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lt.color || '#6b7280' }}
                  />
                  {lt.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredAdjustments?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No adjustments found.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Adjustment</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Adjusted By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments?.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(adjustment.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={adjustment.employee?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {adjustment.employee
                            ? `${adjustment.employee.first_name[0]}${adjustment.employee.last_name[0]}`
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {adjustment.employee
                          ? `${adjustment.employee.first_name} ${adjustment.employee.last_name}`
                          : "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: adjustment.leave_type?.color || '#6b7280',
                        }}
                      />
                      <span className="text-sm">
                        {adjustment.leave_type?.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={adjustmentTypeBadgeVariants[adjustment.adjustment_type] || "secondary"}>
                      {adjustmentTypeLabels[adjustment.adjustment_type] || adjustment.adjustment_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`inline-flex items-center gap-1 font-medium ${
                      adjustment.adjustment_days > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {adjustment.adjustment_days > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {adjustment.adjustment_days > 0 ? '+' : ''}
                      {adjustment.adjustment_days}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                      {adjustment.reason || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {adjustment.adjuster
                      ? `${adjustment.adjuster.first_name || ""} ${adjustment.adjuster.last_name || ""}`
                      : "System"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
