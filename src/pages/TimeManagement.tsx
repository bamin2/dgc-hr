import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardCheck, CalendarDays, Mail } from "lucide-react";
import { AttendanceTab } from "@/components/timemanagement/AttendanceTab";
import { LeavesTab } from "@/components/timemanagement/LeavesTab";
import { LeaveEmailTemplatesTab } from "@/components/timemanagement/LeaveEmailTemplatesTab";

export default function TimeManagement() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Time Management"
        subtitle="Manage attendance tracking, leave policies, and employee time off."
      />

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
          <TabsTrigger
            value="email-templates"
            className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab />
        </TabsContent>

        <TabsContent value="leaves" className="mt-6">
          <LeavesTab />
        </TabsContent>

        <TabsContent value="email-templates" className="mt-6">
          <LeaveEmailTemplatesTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
