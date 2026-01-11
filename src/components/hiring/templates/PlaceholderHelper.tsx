import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PLACEHOLDERS = [
  { key: "{candidate_name}", description: "Full name of the candidate" },
  { key: "{candidate_first_name}", description: "First name only" },
  { key: "{candidate_last_name}", description: "Last name only" },
  { key: "{job_title}", description: "Position/job title" },
  { key: "{department}", description: "Department name" },
  { key: "{work_location}", description: "Work location name" },
  { key: "{start_date}", description: "Proposed start date" },
  { key: "{currency}", description: "Currency code (e.g., BHD, USD)" },
  { key: "{basic_salary}", description: "Base salary amount" },
  { key: "{housing_allowance}", description: "Housing allowance amount" },
  { key: "{transport_allowance}", description: "Transport allowance amount" },
  { key: "{other_allowances}", description: "Other allowances amount" },
  { key: "{gross_pay_total}", description: "Total gross compensation" },
  { key: "{net_pay_estimate}", description: "Estimated net pay" },
  { key: "{employer_gosi_amount}", description: "Employer GOSI contribution" },
  { key: "{company_name}", description: "Company name from settings" },
  { key: "{current_date}", description: "Today's date when sent" },
];

export function PlaceholderHelper() {
  const handleCopy = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    toast({
      title: "Copied",
      description: `${placeholder} copied to clipboard`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Available Placeholders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Click to copy. These will be replaced with actual values when the offer letter is sent.
        </p>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <TooltipProvider>
            {PLACEHOLDERS.map((placeholder) => (
              <Tooltip key={placeholder.key}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-auto py-2 px-3 font-mono text-xs hover:bg-muted"
                    onClick={() => handleCopy(placeholder.key)}
                  >
                    <span className="text-primary">{placeholder.key}</span>
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{placeholder.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
