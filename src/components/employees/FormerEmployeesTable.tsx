import { Search, Users, FileText, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "./StatusBadge";
import { FormerEmployee, useFormerEmployees } from "@/hooks/useFormerEmployees";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

const departureReasonLabels: Record<string, string> = {
  resignation: "Resignation",
  termination: "Termination",
  retirement: "Retirement",
  end_of_contract: "End of Contract",
  mutual_agreement: "Mutual Agreement",
  other: "Other",
};

export function FormerEmployeesTable() {
  const navigate = useNavigate();
  const { data: formerEmployees = [], isLoading, error } = useFormerEmployees();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return formerEmployees;
    
    const query = searchQuery.toLowerCase();
    return formerEmployees.filter(
      (emp) =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query)
    );
  }, [formerEmployees, searchQuery]);

  const handleView = (employee: FormerEmployee) => {
    navigate(`/employees/${employee.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load former employees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search former employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No former employees found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "There are no resigned or terminated employees in the system"}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">Employee Name</TableHead>
                  <TableHead className="font-medium">Email Address</TableHead>
                  <TableHead className="font-medium">Department</TableHead>
                  <TableHead className="font-medium">Job Title</TableHead>
                  <TableHead className="font-medium">Join Date</TableHead>
                  <TableHead className="font-medium">Last Working Day</TableHead>
                  <TableHead className="font-medium">Departure Reason</TableHead>
                  <TableHead className="font-medium">Exit Interview</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

                  return (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(employee)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={employee.avatar}
                              alt={`${employee.firstName} ${employee.lastName}`}
                            />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.department || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.position || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(employee.joinDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.lastWorkingDay
                          ? format(new Date(employee.lastWorkingDay), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {employee.departureReason ? (
                          <Badge variant="outline" className="font-normal">
                            {departureReasonLabels[employee.departureReason] ||
                              employee.departureReason}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                {employee.exitInterviewCompleted === true ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                      Completed
                                    </span>
                                  </>
                                ) : employee.exitInterviewCompleted === false ? (
                                  <>
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm text-amber-600 dark:text-amber-400">
                                      Pending
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </div>
                            </TooltipTrigger>
                            {employee.exitInterviewNotes && (
                              <TooltipContent
                                side="left"
                                className="max-w-xs"
                              >
                                <div className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                                  <p className="text-sm">
                                    {employee.exitInterviewNotes}
                                  </p>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} former employee
            {filteredEmployees.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </div>
  );
}
