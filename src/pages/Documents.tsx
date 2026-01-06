import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesTab } from "@/components/documents";
import { FileText } from "lucide-react";

export default function Documents() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage company templates and employee documents
            </p>
          </div>
        </div>

        {/* Tabs */}
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
      </div>
    </div>
  );
}
