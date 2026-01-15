import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
import { useMyEmployee } from '@/hooks/useMyEmployee';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import {
  MyProfileHeader,
  MyProfileOverviewTab,
  MyProfilePersonalTab,
  MyProfileCompensationTab,
  MyProfileDocumentsTab,
  MyProfileTimeOffTab,
  MyProfileLoansTab,
} from '@/components/myprofile';

const MyProfileSkeleton = () => (
  <DashboardLayout>
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  </DashboardLayout>
);

const MyProfilePage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const { data: employee, isLoading, error } = useMyEmployee();
  const { settings, isLoading: settingsLoading } = useCompanySettings();

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Get compensation visibility settings
  const canViewCompensation = settings?.employeeCanViewCompensation ?? true;
  const showLineItems = settings?.showCompensationLineItems ?? false;

  if (isLoading || settingsLoading) {
    return <MyProfileSkeleton />;
  }

  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load your profile. Please contact HR if this issue persists.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'personal', label: 'Personal' },
    ...(canViewCompensation ? [{ value: 'compensation', label: 'Compensation' }] : []),
    { value: 'documents', label: 'Documents' },
    { value: 'timeoff', label: 'Time Off' },
    { value: 'loans', label: 'Loans' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <MyProfileHeader employee={employee} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-none h-auto p-1 bg-muted/50 rounded-lg">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="min-w-fit px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 sm:mt-6">
            <TabsContent value="overview" className="m-0">
              <MyProfileOverviewTab employee={employee} />
            </TabsContent>

            <TabsContent value="personal" className="m-0">
              <MyProfilePersonalTab employee={employee} />
            </TabsContent>

            {canViewCompensation && (
              <TabsContent value="compensation" className="m-0">
                <MyProfileCompensationTab 
                  employee={employee} 
                  showLineItems={showLineItems} 
                />
              </TabsContent>
            )}

            <TabsContent value="documents" className="m-0">
              <MyProfileDocumentsTab employeeId={employee.id} />
            </TabsContent>

            <TabsContent value="timeoff" className="m-0">
              <MyProfileTimeOffTab employeeId={employee.id} />
            </TabsContent>

            <TabsContent value="loans" className="m-0">
              <MyProfileLoansTab employeeId={employee.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyProfilePage;
