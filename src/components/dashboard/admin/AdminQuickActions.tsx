import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  UserPlus, 
  FileText,
  Settings,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Run Payroll',
      icon: Wallet,
      onClick: () => navigate('/payroll'),
      variant: 'default' as const,
    },
    {
      label: 'Add Employee',
      icon: UserPlus,
      onClick: () => navigate('/team?action=add'),
      variant: 'outline' as const,
    },
    {
      label: 'HR Letters',
      icon: FileText,
      onClick: () => navigate('/documents/templates'),
      variant: 'outline' as const,
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/settings'),
      variant: 'ghost' as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Admin Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className="justify-start gap-2 text-xs"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
