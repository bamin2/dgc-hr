import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConvertToEmployee } from "@/hooks/useConvertToEmployee";
import type { OfferVersion } from "@/hooks/useOffers";
import { toast } from "sonner";
import { format } from "date-fns";

interface ConvertToEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    nationality?: string | null;
  };
  offerId: string;
  version: OfferVersion;
}

export function ConvertToEmployeeDialog({
  open,
  onOpenChange,
  candidate,
  offerId,
  version,
}: ConvertToEmployeeDialogProps) {
  const navigate = useNavigate();
  const convertToEmployee = useConvertToEmployee();

  const handleConvert = async () => {
    try {
      const result = await convertToEmployee.mutateAsync({
        candidateId: candidate.id,
        offerId,
        versionId: version.id,
      });
      toast.success("Candidate converted to employee successfully!");
      onOpenChange(false);
      navigate(`/employees/${result.employeeId}`);
    } catch (error) {
      toast.error("Failed to convert candidate to employee");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Convert to Employee
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will create an active employee record from the accepted offer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* Candidate Info */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{candidate.first_name} {candidate.last_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">{candidate.phone}</span>
                  </div>
                )}
                {candidate.nationality && (
                  <div>
                    <span className="text-muted-foreground">Nationality: </span>
                    <span className="font-medium">{candidate.nationality}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role from Version */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Role (from Offer v{version.version_number})</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {version.department?.name && (
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span className="font-medium">{version.department.name}</span>
                  </div>
                )}
                {version.position?.title && (
                  <div>
                    <span className="text-muted-foreground">Position: </span>
                    <span className="font-medium">{version.position.title}</span>
                  </div>
                )}
                {version.work_location?.name && (
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">{version.work_location.name}</span>
                  </div>
                )}
                {version.start_date && (
                  <div>
                    <span className="text-muted-foreground">Start Date: </span>
                    <span className="font-medium">{format(new Date(version.start_date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compensation from Version */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Compensation</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Basic Salary: </span>
                  <span className="font-medium">{version.currency_code} {version.basic_salary?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gross Pay: </span>
                  <span className="font-medium text-primary">{version.currency_code} {version.gross_pay_total?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">What will happen:</p>
              <ul className="text-amber-700 mt-1 space-y-1">
                <li>• A new active employee record will be created</li>
                <li>• Allowances from the offer will be applied</li>
                <li>• The candidate status will be set to archived</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConvert}
            disabled={convertToEmployee.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {convertToEmployee.isPending ? (
              "Converting..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Convert to Employee
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
