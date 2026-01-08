import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Clock, 
  FolderKanban, 
  Calendar, 
  BarChart3, 
  Timer, 
  Video, 
  Megaphone, 
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardCardVisibility } from '@/data/settings';

interface DashboardSettingsTabProps {
  visibility: DashboardCardVisibility;
  onChange: (visibility: DashboardCardVisibility) => void;
}

const cardConfig = [
  { id: 'metrics' as const, label: 'Metrics Cards', description: 'Employee counts, attendance, and work hours summary', icon: LayoutDashboard },
  { id: 'timeTracker' as const, label: 'Time Tracker', description: 'Clock in/out functionality for employees', icon: Clock },
  { id: 'projectEvaluation' as const, label: 'Project Evaluation', description: 'Project progress and status overview', icon: FolderKanban },
  { id: 'calendarWidget' as const, label: 'Calendar Widget', description: 'Upcoming events and meetings calendar', icon: Calendar },
  { id: 'workHoursChart' as const, label: 'Work Hours Chart', description: 'Weekly work hours visualization', icon: BarChart3 },
  { id: 'dailyTimeLimits' as const, label: 'Daily Time Limits', description: 'Team member daily time tracking limits', icon: Timer },
  { id: 'meetingCards' as const, label: 'Meeting Cards', description: 'Upcoming scheduled meetings', icon: Video },
  { id: 'announcements' as const, label: 'Announcements', description: 'Company-wide announcements and updates', icon: Megaphone },
  { id: 'attendanceOverview' as const, label: 'Attendance Overview', description: 'Daily attendance summary', icon: Users },
];

export function DashboardSettingsTab({ visibility, onChange }: DashboardSettingsTabProps) {
  const allEnabled = Object.values(visibility).every(Boolean);
  const someEnabled = Object.values(visibility).some(Boolean);

  const handleToggle = (cardId: keyof DashboardCardVisibility) => {
    onChange({
      ...visibility,
      [cardId]: !visibility[cardId],
    });
  };

  const handleToggleAll = () => {
    const newValue = !allEnabled;
    const newVisibility = Object.keys(visibility).reduce((acc, key) => {
      acc[key as keyof DashboardCardVisibility] = newValue;
      return acc;
    }, {} as DashboardCardVisibility);
    onChange(newVisibility);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dashboard Card Visibility</CardTitle>
              <CardDescription>
                Configure which cards employees see on their dashboard. HR and Admin users always see all cards.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleAll}
              className="flex items-center gap-2"
            >
              {allEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {allEnabled ? 'Hide All' : 'Show All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cardConfig.map((card) => {
              const Icon = card.icon;
              const isEnabled = visibility[card.id];
              
              return (
                <div 
                  key={card.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isEnabled ? 'bg-card' : 'bg-muted/50'
                  }`}
                >
                  <div className={`rounded-lg p-2 ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={card.id} className="font-medium cursor-pointer">
                        {card.label}
                      </Label>
                      <Switch
                        id={card.id}
                        checked={isEnabled}
                        onCheckedChange={() => handleToggle(card.id)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility Preview</CardTitle>
          <CardDescription>
            {someEnabled 
              ? `${Object.values(visibility).filter(Boolean).length} of ${cardConfig.length} cards visible to employees`
              : 'No cards visible to employees - they will see an empty dashboard'
            }
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
