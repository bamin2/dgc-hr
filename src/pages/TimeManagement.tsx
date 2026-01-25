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
        <TabsList>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leaves">
            <CalendarDays className="h-4 w-4" />
            Leaves
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="h-4 w-4" />
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
