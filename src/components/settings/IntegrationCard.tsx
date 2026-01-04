import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Calendar, 
  Calculator, 
  FileSpreadsheet, 
  HardDrive, 
  Cloud, 
  Wallet,
  Monitor,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { Integration } from '@/data/settings';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  slack: MessageSquare,
  calendar: Calendar,
  microsoft: Monitor,
  calculator: Calculator,
  'file-spreadsheet': FileSpreadsheet,
  'hard-drive': HardDrive,
  cloud: Cloud,
  wallet: Wallet
};

export const IntegrationCard = ({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onConfigure 
}: IntegrationCardProps) => {
  const Icon = iconMap[integration.icon] || Cloud;
  const isConnected = integration.status === 'connected';

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isConnected ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`h-6 w-6 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{integration.name}</h3>
              <Badge 
                variant={isConnected ? 'default' : 'secondary'}
                className={`flex items-center gap-1 ${isConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
            {integration.lastSynced && (
              <p className="text-xs text-muted-foreground">
                Last synced: {format(new Date(integration.lastSynced), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
          {isConnected ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onConfigure(integration.id)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDisconnect(integration.id)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onConnect(integration.id)}
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
