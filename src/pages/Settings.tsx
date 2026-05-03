import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CompanyProfileForm, 
  UserPreferencesForm, 
  NotificationSettingsForm, 
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
  CompanySettings,
  UserPreferences,
  NotificationSettings,
  emptyCompanySettings
} from '@/data/settings';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useUserSessions } from '@/hooks/useUserSessions';
import { useRole } from '@/contexts/RoleContext';
import { useIsBelowDesktop } from '@/hooks/use-media-query';
import { Settings, Building2, User, Bell, Shield, Save, Wallet, Loader2, Network, LayoutDashboard, GitBranch, UserCircle, Mail } from 'lucide-react';
import { DashboardCardVisibility, defaultDashboardCardVisibility } from '@/data/settings';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Admin tabs that are restricted on mobile
const ADMIN_TABS = ['company', 'organization', 'dashboard', 'selfservice', 'approvals', 'email-templates', 'payroll'];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings: globalSettings, updateSettings: updateGlobalSettings, isLoading: companyLoading, isSaving: companySaving } = useCompanySettings();
  const { preferences: dbUserPreferences, updatePreferences, isLoading: prefsLoading, isSaving: prefsSaving, jobTitleFromEmployee } = useUserPreferences();
  const { settings: dbNotificationSettings, updateSettings: updateNotifications, isLoading: notifLoading, isSaving: notifSaving } = useNotificationPreferences();
  const { sessions, isLoading: sessionsLoading, revokeSession, revokeAllSessions } = useUserSessions();
  const { canManageRoles } = useRole();
  const isBelowDesktop = useIsBelowDesktop();
  
  // Local state for form editing - start with empty to prevent mock data flash
  const [companySettings, setCompanySettings] = useState<CompanySettings>(emptyCompanySettings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(dbUserPreferences);
  const [hasCompanySettingsLoaded, setHasCompanySettingsLoaded] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(dbNotificationSettings);
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    const validTabs = ['company', 'organization', 'dashboard', 'selfservice', 'approvals', 'email-templates', 'payroll', 'preferences', 'notifications', 'security'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return canManageRoles ? 'company' : 'preferences';
  });

  // Per-tab unsaved-edit tracking
  const [companyDirty, setCompanyDirty] = useState(false);
  const [prefsDirty, setPrefsDirty] = useState(false);
  const [notifDirty, setNotifDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Handle mobile restrictions for admin tabs accessed via deep link
  useEffect(() => {
    if (isBelowDesktop) {
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl && ADMIN_TABS.includes(tabFromUrl)) {
        // Redirect to preferences with a toast
        setSearchParams({ tab: 'preferences' });
        toast.info('Admin settings are only available on desktop');
      }
    }
  }, [isBelowDesktop, searchParams, setSearchParams]);

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const validTabs = ['company', 'organization', 'dashboard', 'selfservice', 'approvals', 'email-templates', 'payroll', 'preferences', 'notifications', 'security'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      // On mobile, only allow personal tabs
      if (isBelowDesktop && ADMIN_TABS.includes(tabFromUrl)) {
        setActiveTab('preferences');
      } else {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, isBelowDesktop]);

  // Sync local state with database when data loads - only when we have real data (non-empty name)
  useEffect(() => {
    if (!companyLoading && globalSettings && globalSettings.name) {
      setCompanySettings(globalSettings);
      setHasCompanySettingsLoaded(true);
    }
  }, [globalSettings, companyLoading]);

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
      // Only save data relevant to the current tab
      switch (activeTab) {
        case 'company':
        case 'dashboard':
        case 'selfservice':
          // These tabs modify companySettings state
          if (canManageRoles && hasCompanySettingsLoaded) {
            await updateGlobalSettings(companySettings);
            setCompanyDirty(false);
          } else if (canManageRoles && !hasCompanySettingsLoaded) {
            toast.error('Company settings are still loading. Please wait.');
            return;
          }
          break;
          
        case 'preferences':
          await updatePreferences(userPreferences);
          setPrefsDirty(false);
          break;
          
        case 'notifications':
          await updateNotifications(notificationSettings);
          setNotifDirty(false);
          break;
          
        // These tabs have their own save mechanisms:
        // organization, approvals, email-templates, payroll, security
        default:
          return;
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleCompanySettingsChange = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    setCompanyDirty(true);
  };

  const handleUserPreferencesChange = (next: UserPreferences) => {
    setUserPreferences(next);
    setPrefsDirty(true);
  };

  const handleNotificationSettingsChange = (next: NotificationSettings) => {
    setNotificationSettings(next);
    setNotifDirty(true);
  };

  const activeTabDirty = useMemo(() => {
    if (['company', 'dashboard', 'selfservice'].includes(activeTab)) return companyDirty;
    if (activeTab === 'preferences') return prefsDirty;
    if (activeTab === 'notifications') return notifDirty;
    return false;
  }, [activeTab, companyDirty, prefsDirty, notifDirty]);

  const requestTabSwitch = (nextTab: string) => {
    if (nextTab === activeTab) return;
    if (activeTabDirty) {
      setPendingTab(nextTab);
      return;
    }
    setActiveTab(nextTab);
  };

  const discardActiveTabChanges = () => {
    if (['company', 'dashboard', 'selfservice'].includes(activeTab)) {
      setCompanySettings(globalSettings);
      setCompanyDirty(false);
    } else if (activeTab === 'preferences') {
      setUserPreferences(dbUserPreferences);
      setPrefsDirty(false);
    } else if (activeTab === 'notifications') {
      setNotificationSettings(dbNotificationSettings);
      setNotifDirty(false);
    }
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
    { value: 'email-templates', label: 'Email Templates', icon: Mail, requiresAdmin: true },
    { value: 'payroll', label: 'Payroll', icon: Wallet, requiresAdmin: true },
    { value: 'preferences', label: 'Preferences', icon: User, requiresAdmin: false },
    { value: 'notifications', label: 'Notifications', icon: Bell, requiresAdmin: false },
    { value: 'security', label: 'Security', icon: Shield, requiresAdmin: false }
  ];

  // On mobile, only show personal tabs (hide admin tabs entirely)
  const visibleTabs = allTabs.filter(tab => {
    if (tab.requiresAdmin) {
      // Admin tabs: show only if user has permission AND not on mobile
      return canManageRoles && !isBelowDesktop;
    }
    return true; // Personal tabs always visible
  });
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
            onChange={(visibility) => {
              setCompanySettings(prev => ({ ...prev, dashboardCardVisibility: visibility }));
              setCompanyDirty(true);
            }}
          />
        ) : null;
      case 'selfservice':
        return canManageRoles ? (
          <SelfServiceSettings
            employeeCanViewCompensation={companySettings.employeeCanViewCompensation ?? true}
            showCompensationLineItems={companySettings.showCompensationLineItems ?? false}
            onChange={(field, value) => {
              setCompanySettings(prev => ({ ...prev, [field]: value }));
              setCompanyDirty(true);
            }}
          />
        ) : null;
      case 'approvals':
        return canManageRoles ? <ApprovalSettingsTab /> : null;
      case 'email-templates':
        return canManageRoles ? <EmailTemplatesTab /> : null;
      case 'payroll':
        return canManageRoles ? <PayrollSettingsTab /> : null;
      case 'preferences':
        return (
          <UserPreferencesForm 
            preferences={userPreferences} 
            onChange={handleUserPreferencesChange}
            jobTitleFromEmployee={jobTitleFromEmployee}
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsForm 
            settings={notificationSettings} 
            onChange={handleNotificationSettingsChange} 
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

  // Determine if current tab needs the global save button
  const tabsWithGlobalSave = ['company', 'dashboard', 'selfservice', 'preferences', 'notifications'];
  const showGlobalSaveButton = tabsWithGlobalSave.includes(activeTab);
  
  // Disable save for company settings tabs until data is loaded
  const companySettingsTabs = ['company', 'dashboard', 'selfservice'];
  const isCompanySettingsTab = companySettingsTabs.includes(activeTab);
  const canSave = isCompanySettingsTab ? (hasCompanySettingsLoaded && !isSaving) : !isSaving;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          subtitle="Manage your workspace and preferences"
          actions={
            showGlobalSaveButton ? (
              <Button onClick={handleSave} disabled={!canSave || !activeTabDirty}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : undefined
          }
        />

        {/* Two-column layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar Navigation */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="bg-card border rounded-lg p-2">
              {/* Mobile: Dropdown selector */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => requestTabSwitch(e.target.value)}
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
                            onClick={() => requestTabSwitch(tab.value)}
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
                          onClick={() => requestTabSwitch(tab.value)}
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
