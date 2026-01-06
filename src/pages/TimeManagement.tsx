import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardCheck, CalendarDays } from "lucide-react";
import { AttendanceTab } from "@/components/timemanagement/AttendanceTab";
import { LeavesTab } from "@/components/timemanagement/LeavesTab";

export default function TimeManagement() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Time Management</h1>
            <p className="text-muted-foreground">
              Manage attendance tracking, leave policies, and employee time off.
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="attendance" className="space-y-6">
            <TabsList className="bg-transparent border-b rounded-none p-0 h-auto w-full justify-start gap-6">
              <TabsTrigger
                value="attendance"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger
                value="leaves"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Leaves
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-6">
              <AttendanceTab />
            </TabsContent>

            <TabsContent value="leaves" className="mt-6">
              <LeavesTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
