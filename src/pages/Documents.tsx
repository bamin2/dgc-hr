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
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="hr-requests">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">HR Requests</span>
            {pendingCount && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs rounded-full">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generated-letters">
            <FileOutput className="h-4 w-4" />
            <span className="hidden sm:inline">Generated Letters</span>
          </TabsTrigger>
          <TabsTrigger value="employee-documents" disabled>
            <Files className="h-4 w-4" />
            <span className="hidden sm:inline">Employee Documents</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" disabled>
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">Contracts</span>
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
