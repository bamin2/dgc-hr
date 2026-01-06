import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, History, Calendar } from 'lucide-react';
import {
  LeaveTypePoliciesTab,
  EmployeeBalancesTab,
  AdjustmentHistoryTab,
  PublicHolidaysTab,
} from '@/components/timemanagement';

export function LeavesTab() {
  return (
    <Tabs defaultValue="policies" className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="policies">
          <FileText className="w-4 h-4 mr-2" />
          Leave Policies
        </TabsTrigger>
        <TabsTrigger value="balances">
          <Users className="w-4 h-4 mr-2" />
          Employee Balances
        </TabsTrigger>
        <TabsTrigger value="holidays">
          <Calendar className="w-4 h-4 mr-2" />
          Public Holidays
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="w-4 h-4 mr-2" />
          Adjustment History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="policies" className="mt-6">
        <LeaveTypePoliciesTab />
      </TabsContent>

      <TabsContent value="balances" className="mt-6">
        <EmployeeBalancesTab />
      </TabsContent>

      <TabsContent value="holidays" className="mt-6">
        <PublicHolidaysTab />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <AdjustmentHistoryTab />
      </TabsContent>
    </Tabs>
  );
}
