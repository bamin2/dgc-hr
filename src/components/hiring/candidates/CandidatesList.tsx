import { useState } from "react";
import { Plus, Search, MoreHorizontal, FileText, Archive, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCandidates, useArchiveCandidate, useDeleteCandidate, type CandidateStatus, type Candidate } from "@/hooks/useCandidates";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { CandidateForm } from "./CandidateForm";
import { CreateOfferWizard } from "../offers/CreateOfferWizard";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function CandidatesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

  const { data: candidates, isLoading } = useCandidates({
    search,
    status: statusFilter,
    department_id: departmentFilter !== "all" ? departmentFilter : undefined,
  });
  const { data: departments } = useDepartmentsManagement();
  const archiveCandidate = useArchiveCandidate();
  const deleteCandidate = useDeleteCandidate();

  const handleCreateOffer = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleOfferCreated = (offerId: string) => {
    setSelectedCandidate(null);
    navigate(`/hiring/offers/${offerId}`);
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
              <SelectItem value="all">All Departments</SelectItem>
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
                <TableHead className="hidden lg:table-cell">Nationality</TableHead>
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
                      {candidate.nationality || "-"}
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
                          <DropdownMenuItem onClick={() => setCandidateToEdit(candidate)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCreateOffer(candidate)}
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
                          <DropdownMenuItem
                            onClick={() => setCandidateToDelete(candidate)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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

      {/* Create Offer Wizard Sheet */}
      <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <SheetContent className="sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0">
            <SheetTitle>Create Offer</SheetTitle>
          </SheetHeader>
          {selectedCandidate && (
            <CreateOfferWizard
              candidate={selectedCandidate}
              onSuccess={handleOfferCreated}
              onCancel={() => setSelectedCandidate(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Candidate Sheet */}
      <Sheet open={!!candidateToEdit} onOpenChange={(open) => !open && setCandidateToEdit(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Candidate</SheetTitle>
          </SheetHeader>
          <CandidateForm 
            candidate={candidateToEdit} 
            onSuccess={() => setCandidateToEdit(null)} 
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!candidateToDelete} onOpenChange={(open) => !open && setCandidateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {candidateToDelete?.first_name} {candidateToDelete?.last_name} and all associated offers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (candidateToDelete) {
                  deleteCandidate.mutate(candidateToDelete.id);
                  setCandidateToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
