import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLeaveRequests, useDeleteLeaveRequest, LeaveRequestStatus, LeaveRequest } from "@/hooks/useLeaveRequests";
import { LeaveRequestDetailDialog } from "./LeaveRequestDetailDialog";
import { EditLeaveRequestDialog } from "./EditLeaveRequestDialog";

const statusStyles: Record<LeaveRequestStatus, string> = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export function LeavesBalancesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  
  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { data: leaveRequests, isLoading } = useLeaveRequests();
  const deleteRequest = useDeleteLeaveRequest();

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
  };

  const handleCancelRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedRequest) {
      await deleteRequest.mutateAsync(selectedRequest.id);
      setIsCancelDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const filteredEntries = (leaveRequests || []).filter((entry) => {
    // Exclude public holidays - they should only show on the calendar
    if (entry.leave_type?.name === 'Public Holiday') {
      return false;
    }
    
    const leaveTypeName = entry.leave_type?.name || '';
    const reason = entry.reason || '';
    return (
      reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedEntries.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedEntries.map((e) => e.id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="border rounded-lg">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Select defaultValue="date">
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by date</SelectItem>
              <SelectItem value="type">Sort by type</SelectItem>
              <SelectItem value="status">Sort by status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === paginatedEntries.length && paginatedEntries.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Date To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(entry.id)}
                      onCheckedChange={() => toggleRow(entry.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {entry.leave_type?.color && (
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.leave_type.color }}
                        />
                      )}
                      {entry.leave_type?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(entry.start_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{entry.days_count} day{entry.days_count > 1 ? "s" : ""}</TableCell>
                  <TableCell>{format(new Date(entry.end_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", statusStyles[entry.status])}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {entry.reason || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(entry)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        {entry.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelRequest(entry)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredEntries.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredEntries.length)} of{" "}
              {filteredEntries.length} entries
            </span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Show 8</SelectItem>
                <SelectItem value="10">Show 10</SelectItem>
                <SelectItem value="20">Show 20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <LeaveRequestDetailDialog
        request={selectedRequest}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <EditLeaveRequestDialog
        request={selectedRequest}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this leave request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRequest.isPending ? "Cancelling..." : "Cancel Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
