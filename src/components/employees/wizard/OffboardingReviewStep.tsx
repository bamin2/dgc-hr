import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  User,
  MessageSquare,
  Package,
  ShieldOff,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  type EmployeeDepartureData,
  type ExitInterviewData,
  type AssetItem,
  type AccessSystem,
} from "./OffboardingWizard";
import {
  departureReasonOptions,
  noticePeriodStatusOptions,
  interviewFormatOptions,
} from "@/hooks/useOffboarding";
import { useEmployees } from "@/hooks/useEmployees";
import { format } from "date-fns";

interface EmployeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

interface OffboardingReviewStepProps {
  employee: EmployeeInfo;
  departureData: EmployeeDepartureData;
  interviewData: ExitInterviewData;
  assets: AssetItem[];
  systems: AccessSystem[];
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function OffboardingReviewStep({
  employee,
  departureData,
  interviewData,
  assets,
  systems,
  notes,
  onNotesChange,
}: OffboardingReviewStepProps) {
  const { data: employees = [] } = useEmployees();

  const pendingAssets = assets.filter((a) => a.condition === "pending").length;
  const returnedAssets = assets.filter((a) => a.condition === "good" || a.condition === "damaged").length;
  const scheduledSystems = systems.filter((s) => s.status === "scheduled").length;

  const interviewer = employees.find((e) => e.id === interviewData.interviewer);
  const interviewFormat = interviewFormatOptions.find((f) => f.value === interviewData.format);
  const departureReason = departureReasonOptions.find((r) => r.value === departureData.departureReason);
  const noticePeriod = noticePeriodStatusOptions.find((s) => s.value === departureData.noticePeriodStatus);

  return (
    <div className="space-y-6">
      {/* Employee Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Employee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
              <p className="text-sm text-muted-foreground">{employee.jobTitle} • {employee.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Departure Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Departure Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Working Day</span>
              <span className="font-medium">
                {departureData.lastWorkingDay
                  ? format(new Date(departureData.lastWorkingDay), "MMM d, yyyy")
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason</span>
              <span className="font-medium">{departureReason?.label || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notice Period</span>
              <span className="font-medium">{noticePeriod?.label || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Resignation Letter</span>
              {departureData.resignationLetterReceived ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Received
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Manager Confirmed</span>
              {departureData.managerConfirmed ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exit Interview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Exit Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {interviewData.skipInterview ? (
              <div className="text-muted-foreground italic">Interview skipped</div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {interviewData.scheduledDate
                      ? format(new Date(interviewData.scheduledDate), "MMM d, yyyy")
                      : "Not scheduled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{interviewData.scheduledTime || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{interviewFormat?.label || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interviewer</span>
                  <span className="font-medium">
                    {interviewer ? `${interviewer.first_name} ${interviewer.last_name}` : "Not assigned"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Asset Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Assets</span>
              <span className="font-medium">{assets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Returned</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {returnedAssets} items
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <Badge variant="outline" className={pendingAssets > 0 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}>
                {pendingAssets} items
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Access Revocation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldOff className="h-4 w-4 text-primary" />
              Access Revocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Systems</span>
              <span className="font-medium">{systems.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Scheduled</span>
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                {scheduledSystems} systems
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revoked</span>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {systems.filter((s) => s.status === "revoked").length} systems
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What Happens Next</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <p className="font-medium">Offboarding Initiated</p>
                <p className="text-sm text-muted-foreground">HR and manager are notified, tasks are assigned</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">2</div>
              <div>
                <p className="font-medium">Exit Interview Conducted</p>
                <p className="text-sm text-muted-foreground">
                  {interviewData.skipInterview
                    ? "Skipped"
                    : interviewData.scheduledDate
                    ? `Scheduled for ${format(new Date(interviewData.scheduledDate), "MMM d, yyyy")}`
                    : "To be scheduled"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">3</div>
              <div>
                <p className="font-medium">Assets Collected</p>
                <p className="text-sm text-muted-foreground">{assets.length} items to be returned by last working day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">4</div>
              <div>
                <p className="font-medium">Access Revoked</p>
                <p className="text-sm text-muted-foreground">{systems.length} systems scheduled for revocation on last working day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">5</div>
              <div>
                <p className="font-medium">Offboarding Complete</p>
                <p className="text-sm text-muted-foreground">Final settlement processed, employee marked as dismissed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes" className="sr-only">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any additional notes or special instructions for the offboarding process..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
