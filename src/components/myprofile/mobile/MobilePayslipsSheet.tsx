import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useMyPayslips } from '@/hooks/useMyPayslips';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Receipt, Eye, Download, Loader2, Calendar } from 'lucide-react';

interface MobilePayslipsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export function MobilePayslipsSheet({
  open,
  onOpenChange,
  employeeId,
}: MobilePayslipsSheetProps) {
  const { data: payslips, isLoading } = useMyPayslips(employeeId);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Get payroll_run_id and PDF path for a payslip
  const getPayslipPdfPath = async (payslipId: string): Promise<string> => {
    // First get the payroll_run_id from payroll_run_employees
    const { data: employeeRecord, error: employeeError } = await supabase
      .from('payroll_run_employees')
      .select('payroll_run_id')
      .eq('id', payslipId)
      .single();

    if (employeeError || !employeeRecord) {
      throw new Error('Payslip record not found');
    }

    // Then get the PDF path from payslip_documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docResult = await (supabase as any)
      .from('payslip_documents')
      .select('pdf_storage_path')
      .eq('payroll_run_employee_id', payslipId)
      .single();

    if (docResult.error || !docResult.data?.pdf_storage_path) {
      throw new Error('Payslip PDF not found');
    }

    return docResult.data.pdf_storage_path as string;
  };

  const handleView = async (payslipId: string) => {
    try {
      setLoadingId(payslipId);
      const pdfPath = await getPayslipPdfPath(payslipId);

      const { data, error } = await supabase.storage
        .from('payslips')
        .createSignedUrl(pdfPath, 300);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Failed to open payslip');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = async (payslipId: string, periodStart: string) => {
    try {
      setLoadingId(payslipId + '-download');
      const pdfPath = await getPayslipPdfPath(payslipId);

      const { data, error } = await supabase.storage
        .from('payslips')
        .download(pdfPath);

      if (error) throw error;

      const fileName = `Payslip_${format(new Date(periodStart), 'MMM_yyyy')}.pdf`;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Failed to download payslip');
    } finally {
      setLoadingId(null);
    }
  };

  // Show last 6 payslips on mobile
  const recentPayslips = payslips?.slice(0, 6) || [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pr-12">
          <DrawerTitle>My Payslips</DrawerTitle>
        </DrawerHeader>
        
        <DrawerBody>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !recentPayslips.length ? (
            <EmptyState
              icon={Receipt}
              title="No payslips"
              description="You don't have any payslips issued yet."
              size="sm"
            />
          ) : (
            <div className="space-y-3 pb-4">
              {recentPayslips.map((payslip) => (
                <div
                  key={payslip.id}
                  className="rounded-xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {format(new Date(payslip.payPeriodStart), 'MMMM yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payslip.payPeriodStart), 'MMM d')} - {format(new Date(payslip.payPeriodEnd), 'MMM d, yyyy')}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Issued {format(new Date(payslip.issuedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10"
                      onClick={() => handleView(payslip.id)}
                      disabled={loadingId === payslip.id}
                    >
                      {loadingId === payslip.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10"
                      onClick={() => handleDownload(payslip.id, payslip.payPeriodStart)}
                      disabled={loadingId === payslip.id + '-download'}
                    >
                      {loadingId === payslip.id + '-download' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
