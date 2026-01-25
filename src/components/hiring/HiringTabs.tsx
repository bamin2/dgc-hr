import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, FileStack, BarChart3 } from "lucide-react";
import { CandidatesList } from "./candidates/CandidatesList";
import { OffersList } from "./offers/OffersList";
import { TemplatesList } from "./templates/TemplatesList";
import { HiringReportsDashboard } from "./reports/HiringReportsDashboard";

export function HiringTabs() {
  const [activeTab, setActiveTab] = useState("candidates");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="candidates">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Candidates</span>
        </TabsTrigger>
        <TabsTrigger value="offers">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Offers</span>
        </TabsTrigger>
        <TabsTrigger value="templates">
          <FileStack className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </TabsTrigger>
        <TabsTrigger value="reports">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Reports</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="candidates" className="space-y-4">
        <CandidatesList />
      </TabsContent>

      <TabsContent value="offers" className="space-y-4">
        <OffersList />
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <TemplatesList />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <HiringReportsDashboard />
      </TabsContent>
    </Tabs>
  );
}
