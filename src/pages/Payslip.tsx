import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { PayslipCard } from "@/components/payroll";
import { mockPayrollRecords } from "@/data/payroll";

export default function Payslip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const record = mockPayrollRecords.find((r) => r.id === id);

  if (!record) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Payslip not found</h2>
            <p className="text-muted-foreground mb-4">The requested payslip could not be found.</p>
            <Button onClick={() => navigate("/payroll")}>Back to Payroll</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payslip</h1>
              <p className="text-muted-foreground">
                {record.employee.firstName} {record.employee.lastName} - {record.id}
              </p>
            </div>
          </div>

          {/* Payslip Card */}
          <PayslipCard record={record} />
        </div>
      </main>
    </div>
  );
}
