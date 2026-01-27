import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarPlus, 
  Banknote, 
  FileText,
  Zap
} from 'lucide-react';
import { RequestTimeOffDialog } from '@/components/timeoff/RequestTimeOffDialog';
import { EmployeeRequestLoanDialog } from '@/components/loans/EmployeeRequestLoanDialog';
import { RequestHRDocumentDialog } from '@/components/approvals/RequestHRDocumentDialog';

export function PersonalQuickActions() {
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isHRLetterDialogOpen, setIsHRLetterDialogOpen] = useState(false);

  const actions = [
    {
      label: 'Request Time Off',
      icon: CalendarPlus,
      onClick: () => setIsTimeOffDialogOpen(true),
      variant: 'liquidGlass' as const,
      size: 'liquidGlass' as const,
    },
    {
      label: 'Request Loan',
      icon: Banknote,
      onClick: () => setIsLoanDialogOpen(true),
      variant: 'outline' as const,
      size: 'default' as const,
    },
    {
      label: 'HR Letter',
      icon: FileText,
      onClick: () => setIsHRLetterDialogOpen(true),
      variant: 'outline' as const,
      size: 'default' as const,
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
                size={action.size}
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
      
      <RequestTimeOffDialog 
        open={isTimeOffDialogOpen} 
        onOpenChange={setIsTimeOffDialogOpen} 
      />
      
      <EmployeeRequestLoanDialog 
        open={isLoanDialogOpen} 
        onOpenChange={setIsLoanDialogOpen} 
      />
      
      <RequestHRDocumentDialog 
        open={isHRLetterDialogOpen} 
        onOpenChange={setIsHRLetterDialogOpen} 
      />
    </Card>
  );
}
