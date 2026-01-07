import { useState } from "react";
import { Calendar, Target, CalendarPlus } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Time off</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage your team's time off.</p>
            </div>
            <Button onClick={() => setIsRequestDialogOpen(true)} className="w-full sm:w-auto">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Request time off
            </Button>
          </div>

          {/* Tabs */}
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

          {/* Request Time Off Dialog */}
          <RequestTimeOffDialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
          />
        </main>
      </div>
    </div>
  );
}
