import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { User, LogOut } from 'lucide-react';
import { useMyEmployee } from '@/hooks/useMyEmployee';
import { useMyDocuments } from '@/hooks/useMyDocuments';
import { useMyPayslips } from '@/hooks/useMyPayslips';
import { useAuth } from '@/hooks/useAuth';
import { MobileProfileHeader } from './MobileProfileHeader';
import { MobileProfileSectionCard } from './MobileProfileSectionCard';
import { MobilePersonalDetailsSheet } from './MobilePersonalDetailsSheet';
import { MobileDocumentsSheet } from './MobileDocumentsSheet';
import { MobilePayslipsSheet } from './MobilePayslipsSheet';
import { MobileNotificationsSheet } from './MobileNotificationsSheet';
import { MobileSecuritySheet } from './MobileSecuritySheet';
import { FileText, Receipt, Bell, Shield } from 'lucide-react';

type SheetType = 'personal' | 'documents' | 'payslips' | 'notifications' | 'security' | null;

export function MobileProfileHub() {
  const { data: employee, isLoading: employeeLoading } = useMyEmployee();
  const { data: documents } = useMyDocuments(employee?.id);
  const { data: payslips } = useMyPayslips(employee?.id);
  const { signOut } = useAuth();
  
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  // Only show skeleton on initial load, not refetches (avoids flash when switching tabs)
  if (employeeLoading && !employee) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            Unable to load your profile. Please contact HR if this issue persists.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <DashboardLayout>
      <div className="p-4 pb-24 space-y-4">
        {/* Profile Header */}
        <MobileProfileHeader employee={employee} />
        
        {/* Section Cards */}
        <div className="space-y-3">
          <MobileProfileSectionCard
            icon={User}
            title="Personal Details"
            subtitle="Contact info, address, emergency contact"
            onClick={() => setActiveSheet('personal')}
          />
          
          <MobileProfileSectionCard
            icon={FileText}
            title="My Documents"
            subtitle="View and download your documents"
            onClick={() => setActiveSheet('documents')}
            badge={documents?.length || undefined}
          />
          
          <MobileProfileSectionCard
            icon={Receipt}
            title="Payslips"
            subtitle="View and download your payslips"
            onClick={() => setActiveSheet('payslips')}
            badge={payslips?.length || undefined}
          />
          
          <MobileProfileSectionCard
            icon={Bell}
            title="Notifications"
            subtitle="Manage your notification preferences"
            onClick={() => setActiveSheet('notifications')}
          />
          
          <MobileProfileSectionCard
            icon={Shield}
            title="Security"
            subtitle="Sessions and account security"
            onClick={() => setActiveSheet('security')}
          />
        </div>
        
        {/* Sign Out */}
        <div className="pt-4">
          <MobileProfileSectionCard
            icon={LogOut}
            title="Sign Out"
            variant="destructive"
            onClick={handleSignOut}
          />
        </div>
      </div>
      
      {/* Bottom Sheets */}
      <MobilePersonalDetailsSheet
        open={activeSheet === 'personal'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        employee={employee}
      />
      
      <MobileDocumentsSheet
        open={activeSheet === 'documents'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        employeeId={employee.id}
      />
      
      <MobilePayslipsSheet
        open={activeSheet === 'payslips'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        employeeId={employee.id}
      />
      
      <MobileNotificationsSheet
        open={activeSheet === 'notifications'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
      />
      
      <MobileSecuritySheet
        open={activeSheet === 'security'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        onSignOutAll={handleSignOut}
      />
    </DashboardLayout>
  );
}
