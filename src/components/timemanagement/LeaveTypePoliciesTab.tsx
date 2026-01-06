import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { useAllLeaveTypes } from "@/hooks/useLeaveTypes";
import { LeaveTypeCard } from "./LeaveTypeCard";
import { LeaveTypeFormDialog } from "./LeaveTypeFormDialog";

export function LeaveTypePoliciesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: leaveTypes, isLoading } = useAllLeaveTypes();

  const filteredLeaveTypes = leaveTypes?.filter((lt) =>
    lt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leave types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Type
        </Button>
      </div>

      {/* Leave Types List */}
      {filteredLeaveTypes?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No leave types found.</p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredLeaveTypes?.map((leaveType) => (
            <LeaveTypeCard key={leaveType.id} leaveType={leaveType} />
          ))}
        </div>
      )}

      <LeaveTypeFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
