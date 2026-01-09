import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarPlus, 
  Banknote, 
  FileText,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PersonalQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Request Time Off',
      icon: CalendarPlus,
      onClick: () => navigate('/attendance/leave/request'),
      variant: 'default' as const,
    },
    {
      label: 'Request Loan',
      icon: Banknote,
      onClick: () => navigate('/loans?action=request'),
      variant: 'outline' as const,
    },
    {
      label: 'HR Letter',
      icon: FileText,
      onClick: () => navigate('/documents?action=request'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="justify-start gap-2"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
