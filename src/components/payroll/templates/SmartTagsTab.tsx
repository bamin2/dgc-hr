import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, Check, FileText, AlertCircle } from "lucide-react";
import { useActiveSmartTags } from "@/hooks/useSmartTags";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Additional payroll-specific tags that may not be in the smart_tags table
const PAYROLL_SMART_TAGS = [
  { tag: "Base Salary", category: "Payroll", description: "Employee's base monthly salary" },
  { tag: "Gross Pay", category: "Payroll", description: "Total earnings before deductions" },
  { tag: "Net Pay", category: "Payroll", description: "Final amount after all deductions" },
  { tag: "Total Allowances", category: "Payroll", description: "Sum of all allowances" },
  { tag: "Total Deductions", category: "Payroll", description: "Sum of all deductions" },
  { tag: "Housing Allowance", category: "Payroll", description: "Housing allowance amount" },
  { tag: "Transport Allowance", category: "Payroll", description: "Transportation allowance amount" },
  { tag: "GOSI Employee", category: "Payroll", description: "GOSI employee contribution" },
  { tag: "GOSI Employer", category: "Payroll", description: "GOSI employer contribution" },
  { tag: "Pay Period Start", category: "Payroll", description: "Start date of pay period" },
  { tag: "Pay Period End", category: "Payroll", description: "End date of pay period" },
  { tag: "Payment Date", category: "Payroll", description: "Date of payment" },
];

interface SmartTagsTabProps {
  docxStoragePath: string | null;
}

export function SmartTagsTab({ docxStoragePath }: SmartTagsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const { data: smartTags, isLoading } = useActiveSmartTags();

  // Combine database tags with payroll-specific tags
  const allTags = [
    ...(smartTags || []).map((dbTag) => ({
      tag: dbTag.tag,
      category: dbTag.category,
      description: dbTag.description || "",
    })),
    ...PAYROLL_SMART_TAGS,
  ];

  // Filter and group tags
  const filteredTags = allTags.filter(
    (tagItem) =>
      tagItem.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagItem.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagItem.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTags = filteredTags.reduce((acc, tagItem) => {
    if (!acc[tagItem.category]) {
      acc[tagItem.category] = [];
    }
    acc[tagItem.category].push(tagItem);
    return acc;
  }, {} as Record<string, typeof filteredTags>);

  const copyTag = (tagName: string) => {
    const formattedTag = `<<${tagName}>>`;
    navigator.clipboard.writeText(formattedTag);
    setCopiedTag(tagName);
    toast.success(`Copied: ${formattedTag}`);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const sortedCategories = Object.keys(groupedTags).sort((a, b) => {
    // Put Payroll first, then alphabetically
    if (a === "Payroll") return -1;
    if (b === "Payroll") return 1;
    return a.localeCompare(b);
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Smart Tags</CardTitle>
          <CardDescription>
            Use these tags in your DOCX template. They will be replaced with actual data when generating payslips.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="grid gap-2">
                    {groupedTags[category].map((tagItem) => (
                      <div
                        key={tagItem.tag}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                              {`<<${tagItem.tag}>>`}
                            </code>
                          </div>
                          {tagItem.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {tagItem.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTag(tagItem.tag)}
                          className="ml-2 shrink-0"
                        >
                          {copiedTag === tagItem.tag ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {sortedCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tags found matching your search
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {!docxStoragePath && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Upload a template file first to validate which smart tags are used in your document.
          </AlertDescription>
        </Alert>
      )}

      {docxStoragePath && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template Validation</CardTitle>
            <CardDescription>
              Tags found in your uploaded template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                Template validation will be available after saving. The system will parse the DOCX 
                and identify which tags are used.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
