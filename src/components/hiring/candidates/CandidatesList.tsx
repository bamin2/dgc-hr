import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCandidates, useCreateOffer, useArchiveCandidate, type CandidateStatus } from "@/hooks/useCandidates";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { CandidateForm } from "./CandidateForm";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function CandidatesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: candidates, isLoading } = useCandidates({
    search,
    status: statusFilter,
    department_id: departmentFilter || undefined,
  });
  const { data: departments } = useDepartmentsManagement();
  const createOffer = useCreateOffer();
  const archiveCandidate = useArchiveCandidate();

  const handleCreateOffer = async (candidateId: string) => {
    const offer = await createOffer.mutateAsync(candidateId);
    navigate(`/hiring/offers/${offer.id}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CandidateStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_process">In Process</SelectItem>
              <SelectItem value="offer_sent">Offer Sent</SelectItem>
              <SelectItem value="offer_accepted">Accepted</SelectItem>
              <SelectItem value="offer_rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[160px] hidden md:flex">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : candidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                candidates?.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-mono text-sm">{candidate.candidate_code}</TableCell>
                    <TableCell className="font-medium">
                      {candidate.first_name} {candidate.last_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {candidate.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {candidate.department?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <CandidateStatusBadge status={candidate.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {format(new Date(candidate.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCreateOffer(candidate.id)}
                            disabled={candidate.status === 'archived' || candidate.status === 'offer_accepted'}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Create Offer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => archiveCandidate.mutate(candidate.id)}
                            disabled={candidate.status === 'archived'}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Candidate Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Candidate</SheetTitle>
          </SheetHeader>
          <CandidateForm onSuccess={() => setIsFormOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
