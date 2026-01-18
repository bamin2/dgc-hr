import { useState } from "react";
import { Calendar, Target, CalendarPlus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TimeOffCalendarTab,
  LeavesBalancesTab,
  RequestTimeOffDialog,
} from "@/components/timeoff";

export default function TimeOff() {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Time off"
          subtitle="Manage your team's time off."
          actions={
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Request time off
            </Button>
          }
        />

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="bg-transparent border-b rounded-none p-0 h-auto w-full justify-start gap-6">
            <TabsTrigger
              value="calendar"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="leaves"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
            >
              <Target className="w-4 h-4 mr-2" />
              Leave and balances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <TimeOffCalendarTab />
          </TabsContent>

          <TabsContent value="leaves" className="mt-6">
            <LeavesBalancesTab />
          </TabsContent>
        </Tabs>

        <RequestTimeOffDialog
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
