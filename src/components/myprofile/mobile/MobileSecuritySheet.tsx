import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useUserSessions } from '@/hooks/useUserSessions';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Tablet, 
  X, 
  Loader2,
  LogOut,
  CheckCircle,
} from 'lucide-react';

interface MobileSecuritySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOutAll: () => void;
}

export function MobileSecuritySheet({
  open,
  onOpenChange,
  onSignOutAll,
}: MobileSecuritySheetProps) {
  const { 
    sessions, 
    isLoading, 
    revokeSession, 
    revokeAllSessions,
    isRevoking,
    isRevokingAll,
  } = useUserSessions();

  const getDeviceIcon = (device: string | null) => {
    if (!device) return Monitor;
    const d = device.toLowerCase();
    if (d.includes('iphone') || d.includes('android phone')) return Smartphone;
    if (d.includes('ipad') || d.includes('tablet')) return Tablet;
    return Monitor;
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSession(sessionId);
    toast.success('Session revoked');
  };

  const handleRevokeAll = () => {
    revokeAllSessions();
    toast.success('All other sessions signed out');
  };

  const otherSessions = sessions.filter(s => !s.is_current);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pr-12">
          <DrawerTitle>Security</DrawerTitle>
        </DrawerHeader>
        
        <DrawerBody className="space-y-6">
          {/* Current Session */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Current Session
            </h3>
            
            {isLoading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : (
              sessions.filter(s => s.is_current).map(session => {
                const DeviceIcon = getDeviceIcon(session.device);
                return (
                  <div
                    key={session.id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <DeviceIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{session.device}</p>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.browser}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Active {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <Separator />
          
          {/* Other Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Other Sessions</h3>
              {otherSessions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokeAll}
                  disabled={isRevokingAll}
                  className="text-destructive hover:text-destructive h-8"
                >
                  {isRevokingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Sign out all'
                  )}
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : otherSessions.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No other sessions"
                description="You're only signed in on this device."
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {otherSessions.map(session => {
                  const DeviceIcon = getDeviceIcon(session.device);
                  return (
                    <div
                      key={session.id}
                      className="rounded-xl border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{session.device}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.browser}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={isRevoking}
                          className="h-10 w-10 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DrawerBody>
        
        <DrawerFooter>
          <Button
            variant="destructive"
            onClick={onSignOutAll}
            className="w-full h-12"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out of This Device
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
