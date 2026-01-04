import { useState } from 'react';
import { Sidebar, Header } from '@/components/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  CompanyProfileForm, 
  UserPreferencesForm, 
  NotificationSettingsForm, 
  IntegrationsGrid,
  SecuritySettings 
} from '@/components/settings';
import { 
  companySettings as initialCompanySettings, 
  userPreferences as initialUserPreferences, 
  notificationSettings as initialNotificationSettings,
  integrations as initialIntegrations,
  securitySessions as initialSessions,
  CompanySettings,
  UserPreferences,
  NotificationSettings
} from '@/data/settings';
import { Settings, Building2, User, Bell, Puzzle, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState('company');

  const handleSave = () => {
    toast.success('Settings saved successfully');
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

  const tabs = [
    { value: 'company', label: 'Company Profile', icon: Building2 },
    { value: 'preferences', label: 'Preferences', icon: User },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'integrations', label: 'Integrations', icon: Puzzle },
    { value: 'security', label: 'Security', icon: Shield }
  ];

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
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto gap-1 p-1">
                {tabs.map((tab) => {
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

              <TabsContent value="company" className="mt-6">
                <CompanyProfileForm 
                  settings={companySettings} 
                  onChange={setCompanySettings} 
                />
              </TabsContent>

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
