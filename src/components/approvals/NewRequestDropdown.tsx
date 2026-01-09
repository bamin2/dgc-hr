import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Calendar, Banknote, FileText } from "lucide-react";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "./RequestHRDocumentDialog";

export function NewRequestDropdown() {
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [hrDocOpen, setHrDocOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setTimeOffOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Time Off
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLoanOpen(true)}>
            <Banknote className="h-4 w-4 mr-2" />
            Loan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHrDocOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            HR Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RequestTimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} />
      <EmployeeRequestLoanDialog open={loanOpen} onOpenChange={setLoanOpen} />
      <RequestHRDocumentDialog open={hrDocOpen} onOpenChange={setHrDocOpen} />
    </>
  );
}
