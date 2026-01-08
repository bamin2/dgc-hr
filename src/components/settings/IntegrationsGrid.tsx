import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { IntegrationCard } from './IntegrationCard';
import { SettingsCard } from './SettingsCard';
import { Search, Key, Link2, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Integration } from '@/data/settings';

interface IntegrationsGridProps {
  integrations: Integration[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
}

export const IntegrationsGrid = ({ 
  integrations, 
  onConnect, 
  onDisconnect, 
  onConfigure 
}: IntegrationsGridProps) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'communication', label: 'Communication' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'storage', label: 'Storage' }
  ];

  const filteredIntegrations = integrations.filter((int) => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) ||
                          int.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || int.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('https://api.franfer.com/webhooks/hr-system');
    toast.success('Webhook URL copied to clipboard');
  };

  const handleGenerateApiKey = () => {
    toast.success('New API key generated');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="h-auto flex flex-wrap gap-1 p-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs whitespace-nowrap">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onConfigure={onConfigure}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No integrations found matching your criteria
        </div>
      )}

      <SettingsCard 
        title="API Settings" 
        description="Manage your API credentials"
        icon={Key}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                value="sk_live_xxxxxxxxxxxxxxxxxxxx"
                readOnly
                className="font-mono bg-muted"
              />
              <Button variant="outline" onClick={handleGenerateApiKey}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Keep this key secret and never expose it in client-side code</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook URL</label>
            <div className="flex gap-2">
              <Input
                value="https://api.franfer.com/webhooks/hr-system"
                readOnly
                className="font-mono bg-muted"
              />
              <Button variant="outline" onClick={handleCopyWebhook}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Use this URL to receive real-time updates</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
