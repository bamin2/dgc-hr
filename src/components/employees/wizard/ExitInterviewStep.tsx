import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, ClipboardList, Video, FileText, Users } from "lucide-react";
import { type ExitInterviewData, type InterviewFormat } from "./OffboardingWizard";
import { interviewFormatOptions } from "@/hooks/useOffboarding";
import { useEmployees } from "@/hooks/useEmployees";

interface ExitInterviewStepProps {
  interviewData: ExitInterviewData;
  onInterviewDataChange: (data: ExitInterviewData) => void;
}

const interviewQuestions = [
  "What is your primary reason for leaving?",
  "How would you rate your overall job satisfaction? (1-5)",
  "Would you recommend this company to others?",
  "How would you describe your relationship with your manager?",
  "What could the company have done differently to retain you?",
  "Do you have any concerns you would like to raise?",
];

export function ExitInterviewStep({
  interviewData,
  onInterviewDataChange,
}: ExitInterviewStepProps) {
  const { data: employees = [] } = useEmployees();

  const updateField = <K extends keyof ExitInterviewData>(
    field: K,
    value: ExitInterviewData[K]
  ) => {
    onInterviewDataChange({ ...interviewData, [field]: value });
  };

  const hrEmployees = employees.filter(
    (emp) => emp.department === "Human Resources"
  );

  const formatIcons: Record<InterviewFormat, React.ReactNode> = {
    in_person: <Users className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    written: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Skip Interview Option */}
      <Card className={interviewData.skipInterview ? "border-muted bg-muted/30" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="skipInterview"
              checked={interviewData.skipInterview}
              onCheckedChange={(checked) =>
                updateField("skipInterview", checked as boolean)
              }
            />
            <Label
              htmlFor="skipInterview"
              className="text-sm font-medium cursor-pointer"
            >
              Skip exit interview
            </Label>
          </div>
          {interviewData.skipInterview && (
            <p className="text-sm text-muted-foreground mt-2 ml-6">
              The exit interview will be marked as optional and skipped.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interview Details */}
      <Card className={interviewData.skipInterview ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interview Details
          </CardTitle>
          <CardDescription>
            Schedule the exit interview and select the format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interview Format */}
          <div className="space-y-3">
            <Label>Interview Format *</Label>
            <RadioGroup
              value={interviewData.format}
              onValueChange={(value: InterviewFormat) => updateField("format", value)}
              className="grid grid-cols-3 gap-4"
            >
              {interviewFormatOptions.map((format) => (
                <div key={format.value}>
                  <RadioGroupItem
                    value={format.value}
                    id={format.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={format.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {formatIcons[format.value]}
                    <span className="mt-2 font-medium">{format.label}</span>
                    <span className="mt-1 text-xs text-muted-foreground text-center">
                      {format.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Interview Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={interviewData.scheduledDate}
                onChange={(e) => updateField("scheduledDate", e.target.value)}
                disabled={interviewData.skipInterview}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Interview Time *</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={interviewData.scheduledTime}
                onChange={(e) => updateField("scheduledTime", e.target.value)}
                disabled={interviewData.skipInterview}
              />
            </div>
          </div>

          {/* Interviewer */}
          <div className="space-y-2">
            <Label htmlFor="interviewer">Interviewer *</Label>
            <Select
              value={interviewData.interviewer}
              onValueChange={(value) => updateField("interviewer", value)}
              disabled={interviewData.skipInterview}
            >
              <SelectTrigger id="interviewer">
                <SelectValue placeholder="Select HR representative" />
              </SelectTrigger>
              <SelectContent>
                {hrEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
                {hrEmployees.length === 0 && (
                  <SelectItem value="hr-default">HR Representative</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interview Questions Preview */}
      <Card className={interviewData.skipInterview ? "opacity-50" : ""}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Interview Questions Preview
          </CardTitle>
          <CardDescription>
            These questions will be covered during the exit interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {interviewQuestions.map((question, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm">{question}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
