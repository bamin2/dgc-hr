import { useState, useMemo, useEffect } from "react";
import { Plus, Upload, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  TeamMemberTable,
  TeamMemberFilters,
  OnboardingDialog,
  OffboardingDialog,
  BulkUpdateSalariesDialog,
} from "@/components/team";
import { TablePagination } from "@/components/employees";
import { mockTeamMembers, type TeamMember as TeamMemberType, type TeamMemberStatus } from "@/data/team";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type TabType = 'all' | 'active' | 'onboarding' | 'offboarding' | 'dismissed';

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All Member' },
  { id: 'active', label: 'Active' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'offboarding', label: 'Offboarding' },
  { id: 'dismissed', label: 'Dismissed' },
];

export default function TeamMember() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMemberType[]>(mockTeamMembers);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Onboarding dialog state
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);
  const [selectedMemberForOnboarding, setSelectedMemberForOnboarding] = useState<TeamMemberType | null>(null);

  // Offboarding dialog state
  const [offboardingDialogOpen, setOffboardingDialogOpen] = useState(false);
  const [selectedMemberForOffboarding, setSelectedMemberForOffboarding] = useState<TeamMemberType | null>(null);

  // Bulk update salaries dialog state
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(8);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, activeTab]);

  // Filter members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter((m) => m.status === activeTab);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter((m) => m.department === departmentFilter);
    }

    return result;
  }, [members, activeTab, searchQuery, departmentFilter]);

  // Paginate members
  const totalPages = Math.ceil(filteredMembers.length / entriesPerPage);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredMembers.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredMembers, currentPage, entriesPerPage]);

  // Get tab counts
  const getTabCount = (tabId: TabType) => {
    if (tabId === 'all') return members.length;
    return members.filter((m) => m.status === tabId).length;
  };

  const handleEdit = (member: TeamMemberType) => {
    navigate(`/employees/${member.id}`);
  };

  const handleDelete = (member: TeamMemberType) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    setSelectedMembers((prev) => prev.filter((id) => id !== member.id));
    toast({
      title: "Member deleted",
      description: `${member.firstName} ${member.lastName} has been removed.`,
    });
  };

  const handleStartOnboarding = (member: TeamMemberType) => {
    setSelectedMemberForOnboarding(member);
    setOnboardingDialogOpen(true);
  };

  const handleOnboardingComplete = () => {
    if (selectedMemberForOnboarding) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberForOnboarding.id ? { ...m, status: "onboarding" } : m
        )
      );
      toast({
        title: "Onboarding started",
        description: `Onboarding has been launched for ${selectedMemberForOnboarding.firstName} ${selectedMemberForOnboarding.lastName}`,
      });
    }
    setOnboardingDialogOpen(false);
    setSelectedMemberForOnboarding(null);
  };

  const handleStartOffboarding = (member: TeamMemberType) => {
    setSelectedMemberForOffboarding(member);
    setOffboardingDialogOpen(true);
  };

  const handleOffboardingComplete = () => {
    if (selectedMemberForOffboarding) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberForOffboarding.id ? { ...m, status: "offboarding" } : m
        )
      );
      toast({
        title: "Offboarding started",
        description: `Offboarding has been launched for ${selectedMemberForOffboarding.firstName} ${selectedMemberForOffboarding.lastName}`,
      });
    }
    setOffboardingDialogOpen(false);
    setSelectedMemberForOffboarding(null);
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your team member data is being exported.",
    });
  };

  const handleBulkSalaryUpdate = (updates: { id: string; previousSalary: number | null; newSalary: number; changeType: string; reason?: string }[]) => {
    setMembers((prev) =>
      prev.map((m) => {
        const update = updates.find((u) => u.id === m.id);
        if (update) {
          return { ...m, salary: update.newSalary };
        }
        return m;
      })
    );
    setSelectedMembers([]);
    // Note: In production, this would also persist the salary history to the database
  };

  // Get selected member objects for the dialog
  const selectedMemberObjects = useMemo(() => {
    return members.filter((m) => selectedMembers.includes(m.id));
  }, [members, selectedMembers]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Team Member</h1>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkUpdateDialogOpen(true)}
                disabled={selectedMembers.length === 0}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Bulk Update Salaries
              </Button>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Upload className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => navigate("/team/add")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add a team member
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getTabCount(tab.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <TeamMemberFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
            />
          </div>

          {/* Table */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No team members found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <TeamMemberTable
                members={paginatedMembers}
                selectedMembers={selectedMembers}
                onSelectionChange={setSelectedMembers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartOnboarding={handleStartOnboarding}
                onStartOffboarding={handleStartOffboarding}
              />
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMembers.length}
                entriesPerPage={entriesPerPage}
                onPageChange={setCurrentPage}
                onEntriesPerPageChange={(entries) => {
                  setEntriesPerPage(entries);
                  setCurrentPage(1);
                }}
              />
            </>
          )}

          {/* Onboarding Dialog */}
          <OnboardingDialog
            open={onboardingDialogOpen}
            onOpenChange={setOnboardingDialogOpen}
            member={selectedMemberForOnboarding}
            onComplete={handleOnboardingComplete}
          />

          {/* Offboarding Dialog */}
          <OffboardingDialog
            open={offboardingDialogOpen}
            onOpenChange={setOffboardingDialogOpen}
            member={selectedMemberForOffboarding}
            onComplete={handleOffboardingComplete}
          />

          {/* Bulk Update Salaries Dialog */}
          <BulkUpdateSalariesDialog
            open={bulkUpdateDialogOpen}
            onOpenChange={setBulkUpdateDialogOpen}
            selectedMembers={selectedMemberObjects}
            onUpdate={handleBulkSalaryUpdate}
          />
        </main>
      </div>
    </div>
  );
}
