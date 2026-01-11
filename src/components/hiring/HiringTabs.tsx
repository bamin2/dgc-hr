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
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
        <TabsTrigger value="candidates" className="gap-2">
          <Users className="h-4 w-4 hidden sm:block" />
          Candidates
        </TabsTrigger>
        <TabsTrigger value="offers" className="gap-2">
          <FileText className="h-4 w-4 hidden sm:block" />
          Offers
        </TabsTrigger>
        <TabsTrigger value="templates" className="gap-2">
          <FileStack className="h-4 w-4 hidden sm:block" />
          Templates
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <BarChart3 className="h-4 w-4 hidden sm:block" />
          Reports
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
