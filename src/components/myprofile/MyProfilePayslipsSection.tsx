import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, Eye, Download, Calendar, Inbox } from 'lucide-react';
import { useMyPayslips } from '@/hooks/useMyPayslips';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MyProfilePayslipsSectionProps {
  employeeId: string;
}

export function MyProfilePayslipsSection({ employeeId }: MyProfilePayslipsSectionProps) {
  const { data: payslips, isLoading, isError } = useMyPayslips(employeeId);
  const navigate = useNavigate();

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${new Intl.NumberFormat().format(amount)}`;
  };

  const formatPayPeriod = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same month/year, show condensed format
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const handleView = (payslipId: string) => {
    navigate(`/my-profile/payslip/${payslipId}`);
  };

  const handleDownload = async (payslipId: string) => {
    // Navigate to the payslip page which has download functionality
    // In a future enhancement, we could trigger direct download here
    toast.info('Opening payslip for download...');
    navigate(`/my-profile/payslip/${payslipId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Payslips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Payslips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Inbox className="h-12 w-12 text-destructive/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Could not load payslips
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!payslips || payslips.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Payslips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No Payslips Available
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Your issued payslips will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Payslips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payslips.map((payslip) => (
          <div
            key={payslip.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-background rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {formatPayPeriod(payslip.payPeriodStart, payslip.payPeriodEnd)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(payslip.netPay, payslip.currency)}
                  </span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {payslip.issuedAt ? format(new Date(payslip.issuedAt), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleView(payslip.id)}
                title="View payslip"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDownload(payslip.id)}
                title="Download payslip"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
