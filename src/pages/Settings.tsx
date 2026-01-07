import { useState, useEffect } from 'react';
import { Sidebar, Header } from '@/components/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CompanyProfileForm, 
  UserPreferencesForm, 
  NotificationSettingsForm, 
  IntegrationsGrid,
  SecuritySettings,
  AuditLogCard,
  OrganizationSettingsTab,
  DashboardSettingsTab
} from '@/components/settings';
import { PayrollSettingsTab } from '@/components/settings/payroll';
import { 
  integrations as initialIntegrations,
  CompanySettings,
  UserPreferences,
  NotificationSettings
} from '@/data/settings';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useUserSessions } from '@/hooks/useUserSessions';
import { useRole } from '@/contexts/RoleContext';
import { Settings, Building2, User, Bell, Puzzle, Shield, Save, Wallet, Loader2, Network, LayoutDashboard } from 'lucide-react';
import { DashboardCardVisibility, defaultDashboardCardVisibility } from '@/data/settings';
import { toast } from 'sonner';

const SettingsPageSkeleton = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </main>
    </div>
  </div>
);

const SettingsPage = () => {
  const { settings: globalSettings, updateSettings: updateGlobalSettings, isLoading: companyLoading, isSaving: companySaving } = useCompanySettings();
  const { preferences: dbUserPreferences, updatePreferences, isLoading: prefsLoading, isSaving: prefsSaving } = useUserPreferences();
  const { settings: dbNotificationSettings, updateSettings: updateNotifications, isLoading: notifLoading, isSaving: notifSaving } = useNotificationPreferences();
  const { sessions, isLoading: sessionsLoading, revokeSession, revokeAllSessions } = useUserSessions();
  const { canManageRoles } = useRole();
  
  // Local state for form editing
  const [companySettings, setCompanySettings] = useState<CompanySettings>(globalSettings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(dbUserPreferences);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(dbNotificationSettings);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [activeTab, setActiveTab] = useState(canManageRoles ? 'company' : 'preferences');

  // Sync local state with database when data loads
  useEffect(() => {
    setCompanySettings(globalSettings);
  }, [globalSettings]);

  useEffect(() => {
    setUserPreferences(dbUserPreferences);
  }, [dbUserPreferences]);

  useEffect(() => {
    setNotificationSettings(dbNotificationSettings);
  }, [dbNotificationSettings]);

  const isLoading = companyLoading || prefsLoading || notifLoading || sessionsLoading;
  const isSaving = companySaving || prefsSaving || notifSaving;

  const handleSave = async () => {
    try {
      const updates: Promise<void>[] = [];
      
      // Save user preferences
      updates.push(updatePreferences(userPreferences));
      
      // Save notification preferences
      updates.push(updateNotifications(notificationSettings));
      
      // Save company settings if admin
      if (canManageRoles) {
        updates.push(updateGlobalSettings(companySettings));
      }

      await Promise.all(updates);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleCompanySettingsChange = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
  };

  const handleConnectIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: 'connected' as const, lastSynced: new Date().toISOString() } : int
    ));
    toast.success('Integration connected');
  };

  const handleDisconnectIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: 'disconnected' as const, lastSynced: undefined } : int
    ));
    toast.success('Integration disconnected');
  };

  const handleConfigureIntegration = (id: string) => {
    toast.info('Configuration panel would open here');
  };

  const handleRevokeSession = (id: string) => {
    revokeSession(id);
    toast.success('Session revoked');
  };

  const handleRevokeAllSessions = () => {
    revokeAllSessions();
    toast.success('All other sessions revoked');
  };

  const allTabs = [
    { value: 'company', label: 'Company Profile', icon: Building2, requiresAdmin: true },
    { value: 'organization', label: 'Organization', icon: Network, requiresAdmin: true },
    { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAdmin: true },
    { value: 'preferences', label: 'Preferences', icon: User, requiresAdmin: false },
    { value: 'notifications', label: 'Notifications', icon: Bell, requiresAdmin: false },
    { value: 'payroll', label: 'Payroll', icon: Wallet, requiresAdmin: true },
    { value: 'integrations', label: 'Integrations', icon: Puzzle, requiresAdmin: false },
    { value: 'security', label: 'Security', icon: Shield, requiresAdmin: false }
  ];

  const visibleTabs = allTabs.filter(tab => !tab.requiresAdmin || canManageRoles);

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your workspace and preferences
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList 
                className="grid w-full h-auto gap-1 p-1 overflow-x-auto" 
                style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(60px, 1fr))` }}
              >
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline text-xs lg:text-sm">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {canManageRoles && (
                <TabsContent value="company" className="mt-6 space-y-6">
                  <CompanyProfileForm 
                    settings={companySettings} 
                    onChange={handleCompanySettingsChange} 
                  />
                  <AuditLogCard />
                </TabsContent>
              )}

              {canManageRoles && (
                <TabsContent value="organization" className="mt-6">
                  <OrganizationSettingsTab />
                </TabsContent>
              )}

              {canManageRoles && (
                <TabsContent value="dashboard" className="mt-6">
                  <DashboardSettingsTab 
                    visibility={companySettings.dashboardCardVisibility ?? defaultDashboardCardVisibility}
                    onChange={(visibility) => setCompanySettings(prev => ({ ...prev, dashboardCardVisibility: visibility }))}
                  />
                </TabsContent>
              )}

              <TabsContent value="preferences" className="mt-6">
                <UserPreferencesForm 
                  preferences={userPreferences} 
                  onChange={setUserPreferences} 
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <NotificationSettingsForm 
                  settings={notificationSettings} 
                  onChange={setNotificationSettings} 
                />
              </TabsContent>

              {canManageRoles && (
                <TabsContent value="payroll" className="mt-6">
                  <PayrollSettingsTab />
                </TabsContent>
              )}

              <TabsContent value="integrations" className="mt-6">
                <IntegrationsGrid 
                  integrations={integrations}
                  onConnect={handleConnectIntegration}
                  onDisconnect={handleDisconnectIntegration}
                  onConfigure={handleConfigureIntegration}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <SecuritySettings 
                  sessions={sessions}
                  onRevokeSession={handleRevokeSession}
                  onRevokeAllSessions={handleRevokeAllSessions}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;