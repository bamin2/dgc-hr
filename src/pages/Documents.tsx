import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesTab } from "@/components/documents";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";

export default function Documents() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Documents"
        subtitle="Manage company templates and employee documents"
      />

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="employee-documents" disabled>
            Employee Documents
          </TabsTrigger>
          <TabsTrigger value="contracts" disabled>
            Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplatesTab />
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
