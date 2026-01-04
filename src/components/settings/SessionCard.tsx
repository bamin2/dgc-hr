import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Globe, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { SecuritySession } from '@/data/settings';

interface SessionCardProps {
  session: SecuritySession;
  onRevoke: (id: string) => void;
}

export const SessionCard = ({ session, onRevoke }: SessionCardProps) => {
  const isDesktop = session.device.toLowerCase().includes('mac') || 
                    session.device.toLowerCase().includes('windows') ||
                    session.device.toLowerCase().includes('pc');

  const Icon = isDesktop ? Monitor : Smartphone;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{session.device}</span>
            {session.isCurrent && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Current Session
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{session.browser}</span>
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {session.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">IP: {session.ipAddress}</p>
        </div>
      </div>
      {!session.isCurrent && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRevoke(session.id)}
        >
          Revoke
        </Button>
      )}
    </div>
  );
};
