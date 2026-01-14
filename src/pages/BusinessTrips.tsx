import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/contexts/RoleContext';
import { MyTripsTab } from '@/components/business-trips/MyTripsTab';
import { TripApprovalsTab } from '@/components/business-trips/TripApprovalsTab';
import { AllTripsTab } from '@/components/business-trips/AllTripsTab';
import { TripReportsTab } from '@/components/business-trips/TripReportsTab';
import { TripSettingsTab } from '@/components/business-trips/TripSettingsTab';
import { Plane, ClipboardCheck, ListFilter, BarChart3, Settings } from 'lucide-react';

export default function BusinessTrips() {
  const { currentUser, canAccessManagement } = useRole();
  const isHROrAdmin = currentUser.role === 'hr' || currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  
  const [activeTab, setActiveTab] = useState('my-trips');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Trips</h1>
          <p className="text-muted-foreground">
            Manage your business travel requests and expenses
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="my-trips" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              My Trips
            </TabsTrigger>
            
            {(isManager || isHROrAdmin) && (
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Approvals
              </TabsTrigger>
            )}
            
            {isHROrAdmin && (
              <>
                <TabsTrigger value="all-trips" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  All Trips
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="my-trips" className="mt-6">
            <MyTripsTab />
          </TabsContent>

          {(isManager || isHROrAdmin) && (
            <TabsContent value="approvals" className="mt-6">
              <TripApprovalsTab />
            </TabsContent>
          )}

          {isHROrAdmin && (
            <>
              <TabsContent value="all-trips" className="mt-6">
                <AllTripsTab />
              </TabsContent>
              <TabsContent value="reports" className="mt-6">
                <TripReportsTab />
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <TripSettingsTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
