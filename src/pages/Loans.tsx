import { useState } from "react";
import { Plus, Banknote, Clock, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LoansTable,
  CreateLoanDialog,
  LoanDetailSheet,
  LoanApprovalDialog,
} from "@/components/loans";
import { useLoans, Loan, useDisburseLoan } from "@/hooks/useLoans";
import { toast } from "sonner";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { calculateOutstandingBalance } from "@/lib/dashboard/utils";

export default function Loans() {
  const [activeTab, setActiveTab] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [loanForApproval, setLoanForApproval] = useState<Loan | null>(null);

  const { data: allLoans = [], isLoading: loadingAll } = useLoans();
  const { data: pendingLoans = [], isLoading: loadingPending } = useLoans({ status: "requested" });
  
  const disburseLoan = useDisburseLoan();

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setDetailSheetOpen(true);
  };

  const handleApprove = (loan: Loan) => {
    setLoanForApproval(loan);
    setApprovalDialogOpen(true);
  };

  const handleReject = (loan: Loan) => {
    setLoanForApproval(loan);
    setApprovalDialogOpen(true);
  };

  const handleDisburse = async (loan: Loan) => {
    try {
      await disburseLoan.mutateAsync(loan.id);
      toast.success("Loan disbursed and installments generated");
    } catch (error) {
      toast.error("Failed to disburse loan");
    }
  };

  const { formatCurrency } = useCompanySettings();

  // Calculate metrics
  const activeLoans = allLoans.filter(l => l.status === "active");
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + calculateOutstandingBalance(l.loan_installments || []),
    0
  );
  const pendingCount = pendingLoans.length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
            <p className="text-muted-foreground">
              Manage employee loans, requests, and repayments
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Loan
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently being repaid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground">
                Remaining balance to be repaid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Loans</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Requests
              {pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <LoansTable
              loans={allLoans}
              isLoading={loadingAll}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
              onDisburse={handleDisburse}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <LoansTable
              loans={pendingLoans}
              isLoading={loadingPending}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <LoansTable
              loans={activeLoans}
              isLoading={loadingAll}
              onViewDetails={handleViewDetails}
              onDisburse={handleDisburse}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateLoanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <LoanDetailSheet
        loanId={selectedLoan?.id || null}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <LoanApprovalDialog
        loan={loanForApproval}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      />
    </DashboardLayout>
  );
}
