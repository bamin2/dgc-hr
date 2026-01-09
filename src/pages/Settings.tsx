import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';

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
  DashboardSettingsTab,
  SelfServiceSettings
} from '@/components/settings';
import { PayrollSettingsTab } from '@/components/settings/payroll';
import { ApprovalSettingsTab } from '@/components/settings/approvals';
import { EmailTemplatesTab } from '@/components/settings/email-templates';
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
import { Settings, Building2, User, Bell, Puzzle, Shield, Save, Wallet, Loader2, Network, LayoutDashboard, GitBranch, UserCircle, Mail } from 'lucide-react';
import { DashboardCardVisibility, defaultDashboardCardVisibility } from '@/data/settings';
import { toast } from 'sonner';

const SettingsPageSkeleton = () => (
  <DashboardLayout>
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
  </DashboardLayout>
);

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
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
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    const validTabs = ['company', 'organization', 'dashboard', 'selfservice', 'approvals', 'payroll', 'preferences', 'notifications', 'integrations', 'security'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return canManageRoles ? 'company' : 'preferences';
  });

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const validTabs = ['company', 'organization', 'dashboard', 'selfservice', 'approvals', 'payroll', 'preferences', 'notifications', 'integrations', 'security'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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
    { value: 'selfservice', label: 'Self-Service', icon: UserCircle, requiresAdmin: true },
    { value: 'approvals', label: 'Approvals', icon: GitBranch, requiresAdmin: true },
    { value: 'payroll', label: 'Payroll', icon: Wallet, requiresAdmin: true },
    { value: 'preferences', label: 'Preferences', icon: User, requiresAdmin: false },
    { value: 'notifications', label: 'Notifications', icon: Bell, requiresAdmin: false },
    { value: 'integrations', label: 'Integrations', icon: Puzzle, requiresAdmin: false },
    { value: 'security', label: 'Security', icon: Shield, requiresAdmin: false }
  ];

  const visibleTabs = allTabs.filter(tab => !tab.requiresAdmin || canManageRoles);
  const adminTabs = visibleTabs.filter(tab => tab.requiresAdmin);
  const personalTabs = visibleTabs.filter(tab => !tab.requiresAdmin);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return canManageRoles ? (
          <div className="space-y-6">
            <CompanyProfileForm 
              settings={companySettings} 
              onChange={handleCompanySettingsChange} 
            />
            <AuditLogCard />
          </div>
        ) : null;
      case 'organization':
        return canManageRoles ? <OrganizationSettingsTab /> : null;
      case 'dashboard':
        return canManageRoles ? (
          <DashboardSettingsTab 
            visibility={companySettings.dashboardCardVisibility ?? defaultDashboardCardVisibility}
            onChange={(visibility) => setCompanySettings(prev => ({ ...prev, dashboardCardVisibility: visibility }))}
          />
        ) : null;
      case 'selfservice':
        return canManageRoles ? (
          <SelfServiceSettings
            employeeCanViewCompensation={companySettings.employeeCanViewCompensation ?? true}
            showCompensationLineItems={companySettings.showCompensationLineItems ?? false}
            onChange={(field, value) => setCompanySettings(prev => ({ ...prev, [field]: value }))}
          />
        ) : null;
      case 'approvals':
        return canManageRoles ? <ApprovalSettingsTab /> : null;
      case 'payroll':
        return canManageRoles ? <PayrollSettingsTab /> : null;
      case 'preferences':
        return (
          <UserPreferencesForm 
            preferences={userPreferences} 
            onChange={setUserPreferences} 
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsForm 
            settings={notificationSettings} 
            onChange={setNotificationSettings} 
          />
        );
      case 'integrations':
        return (
          <IntegrationsGrid 
            integrations={integrations}
            onConnect={handleConnectIntegration}
            onDisconnect={handleDisconnectIntegration}
            onConfigure={handleConfigureIntegration}
          />
        );
      case 'security':
        return (
          <SecuritySettings 
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onRevokeAllSessions={handleRevokeAllSessions}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <DashboardLayout>
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

        {/* Two-column layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar Navigation */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="bg-card border rounded-lg p-2">
              {/* Mobile: Dropdown selector */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                >
                  {adminTabs.length > 0 && (
                    <optgroup label="Admin Settings">
                      {adminTabs.map(tab => (
                        <option key={tab.value} value={tab.value}>{tab.label}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Personal Settings">
                    {personalTabs.map(tab => (
                      <option key={tab.value} value={tab.value}>{tab.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Desktop: Vertical navigation */}
              <nav className="hidden md:block space-y-4">
                {adminTabs.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">
                      Admin Settings
                    </p>
                    <div className="space-y-1">
                      {adminTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.value;
                        return (
                          <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">
                    Personal Settings
                  </p>
                  <div className="space-y-1">
                    {personalTabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.value;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => setActiveTab(tab.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
