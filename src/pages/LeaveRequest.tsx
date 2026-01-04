import { Sidebar, Header } from '@/components/dashboard';
import { LeaveRequestForm } from '@/components/attendance';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LeaveRequest() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate('/attendance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Request Leave</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit a new leave request for approval
            </p>
          </div>

          {/* Leave Request Form */}
          <LeaveRequestForm />
        </main>
      </div>
    </div>
  );
}
