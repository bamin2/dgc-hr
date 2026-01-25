import { useState } from "react";
import { Calendar, Plane, FileText, Banknote } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { CreateTripDialog } from "@/components/business-trips/CreateTripDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";

interface MobileNewRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActionTile {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}

const actionTiles: ActionTile[] = [
  {
    id: "time_off",
    icon: Calendar,
    label: "Time Off",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "business_trip",
    icon: Plane,
    label: "Business Trip",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "hr_letter",
    icon: FileText,
    label: "HR Letter",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    id: "loan",
    icon: Banknote,
    label: "Loan",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export function MobileNewRequestSheet({ open, onOpenChange }: MobileNewRequestSheetProps) {
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [hrLetterOpen, setHrLetterOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);

  const handleTileClick = (tileId: string) => {
    // Close the sheet first
    onOpenChange(false);
    
    // Then open the appropriate dialog
    setTimeout(() => {
      switch (tileId) {
        case "time_off":
          setTimeOffOpen(true);
          break;
        case "business_trip":
          setTripOpen(true);
          break;
        case "hr_letter":
          setHrLetterOpen(true);
          break;
        case "loan":
          setLoanOpen(true);
          break;
      }
    }, 150);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="pb-safe">
          <DrawerHeader className="text-center">
            <DrawerTitle>New Request</DrawerTitle>
          </DrawerHeader>
          
          <div className="grid grid-cols-2 gap-4 p-4 pt-0 pb-8">
            {actionTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3",
                    "min-h-[120px] rounded-2xl border border-border/50",
                    "bg-card active:bg-muted/50",
                    "transition-colors duration-100 touch-manipulation"
                  )}
                >
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", tile.bgColor)}>
                    <Icon className={cn("h-6 w-6", tile.color)} />
                  </div>
                  <span className="text-sm font-medium">{tile.label}</span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Request Dialogs */}
      <RequestTimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} />
      <CreateTripDialog open={tripOpen} onOpenChange={setTripOpen} />
      <RequestHRDocumentDialog open={hrLetterOpen} onOpenChange={setHrLetterOpen} />
      <EmployeeRequestLoanDialog open={loanOpen} onOpenChange={setLoanOpen} />
    </>
  );
}
