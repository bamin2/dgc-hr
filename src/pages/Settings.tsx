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
  SecuritySettings 
} from '@/components/settings';
import { PayrollSettingsTab } from '@/components/settings/payroll';
import { 
  userPreferences as initialUserPreferences, 
  notificationSettings as initialNotificationSettings,
  integrations as initialIntegrations,
  securitySessions as initialSessions,
  CompanySettings,
  UserPreferences,
  NotificationSettings
} from '@/data/settings';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useRole } from '@/contexts/RoleContext';
import { Settings, Building2, User, Bell, Puzzle, Shield, Save, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPageSkeleton = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6 overflow-auto">
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
  const { settings: globalSettings, updateSettings: updateGlobalSettings, isLoading, isSaving } = useCompanySettings();
  const { canManageRoles } = useRole();
  
  // Initialize local state from global context
  const [companySettings, setCompanySettings] = useState<CompanySettings>(globalSettings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState(canManageRoles ? 'company' : 'preferences');

  // Sync local state with global context when it changes
  useEffect(() => {
    setCompanySettings(globalSettings);
  }, [globalSettings]);

  const handleSave = async () => {
    try {
      await updateGlobalSettings(companySettings);
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
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session revoked');
  };

  const handleRevokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    toast.success('All other sessions revoked');
  };

  const allTabs = [
    { value: 'company', label: 'Company Profile', icon: Building2, requiresAdmin: true },
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
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your workspace and preferences
                  </p>
                </div>
              </div>
              {canManageRoles && (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full h-auto gap-1 p-1" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}>
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {canManageRoles && (
                <TabsContent value="company" className="mt-6">
                  <CompanyProfileForm 
                    settings={companySettings} 
                    onChange={handleCompanySettingsChange} 
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
