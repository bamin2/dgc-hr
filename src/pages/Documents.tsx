import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesTab } from "@/components/documents";
import { HRDocumentRequestsTab } from "@/components/documents/HRDocumentRequestsTab";
import { GeneratedHRLettersTab } from "@/components/documents/GeneratedHRLettersTab";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { usePendingHRDocumentRequestsCount } from "@/hooks/useHRDocumentRequests";
import { Badge } from "@/components/ui/badge";
import { FileText, Inbox, Files, FileSignature, FileOutput } from "lucide-react";

export default function Documents() {
  const { data: pendingCount } = usePendingHRDocumentRequestsCount();

  return (
    <DashboardLayout>
      <PageHeader
        title="Documents"
        subtitle="Manage company templates and employee documents"
      />

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="hr-requests" className="gap-2">
            <Inbox className="h-4 w-4" />
            HR Requests
            {pendingCount && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generated-letters" className="gap-2">
            <FileOutput className="h-4 w-4" />
            Generated Letters
          </TabsTrigger>
          <TabsTrigger value="employee-documents" disabled className="gap-2">
            <Files className="h-4 w-4" />
            Employee Documents
          </TabsTrigger>
          <TabsTrigger value="contracts" disabled className="gap-2">
            <FileSignature className="h-4 w-4" />
            Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="hr-requests">
          <HRDocumentRequestsTab />
        </TabsContent>

        <TabsContent value="generated-letters">
          <GeneratedHRLettersTab />
        </TabsContent>

        <TabsContent value="employee-documents">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Coming soon...
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
