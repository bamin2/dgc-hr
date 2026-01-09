import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { CompanySettingsProvider } from "@/contexts/CompanySettingsContext";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import OnboardingDetail from "./pages/OnboardingDetail";
import NewOnboarding from "./pages/NewOnboarding";
import AddTeamMember from "./pages/AddTeamMember";
import BulkSalaryUpdate from "./pages/BulkSalaryUpdate";
import Payroll from "./pages/Payroll";
import PayrollRun from "./pages/PayrollRun";
import Payslip from "./pages/Payslip";

import Benefits from "./pages/Benefits";
import BenefitDetail from "./pages/BenefitDetail";
import BenefitEnrollment from "./pages/BenefitEnrollment";
import ClaimSubmission from "./pages/ClaimSubmission";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";
import Projects from "./pages/Projects";
import TimeOff from "./pages/TimeOff";
import TimeManagement from "./pages/TimeManagement";
import Documents from "./pages/Documents";
import Directory from "./pages/Directory";
import Loans from "./pages/Loans";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CompanySettingsProvider>
        <RoleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                
                {/* Protected routes - All authenticated users */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><TimeManagement /></ProtectedRoute>} />
                <Route path="/time-off" element={<ProtectedRoute><TimeOff /></ProtectedRoute>} />
                <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
                <Route path="/benefits" element={<ProtectedRoute><Benefits /></ProtectedRoute>} />
                <Route path="/benefits/plans/:id" element={<ProtectedRoute><BenefitDetail /></ProtectedRoute>} />
                <Route path="/benefits/enroll" element={<ProtectedRoute><BenefitEnrollment /></ProtectedRoute>} />
                <Route path="/benefits/claims/new" element={<ProtectedRoute><ClaimSubmission /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                
                {/* Protected routes - HR & Admin */}
                <Route path="/employees" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><Employees /></ProtectedRoute>} />
                <Route path="/employees/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin', 'manager']}><EmployeeProfile /></ProtectedRoute>} />
                <Route path="/employees/onboarding/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><NewOnboarding /></ProtectedRoute>} />
                <Route path="/employees/onboarding/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><OnboardingDetail /></ProtectedRoute>} />
                <Route path="/payroll" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><Payroll /></ProtectedRoute>} />
                <Route path="/payroll/run" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><PayrollRun /></ProtectedRoute>} />
                <Route path="/payroll/payslip/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><Payslip /></ProtectedRoute>} />
                <Route path="/loans" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><Loans /></ProtectedRoute>} />
                
                {/* Protected routes - Manager, HR & Admin */}
                <Route path="/team/add" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><AddTeamMember /></ProtectedRoute>} />
                <Route path="/team/bulk-salary-update" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><BulkSalaryUpdate /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><Reports /></ProtectedRoute>} />
                <Route path="/time-management" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><TimeManagement /></ProtectedRoute>} />
                
                {/* Protected routes - Admin only */}
                <Route path="/documents" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><Documents /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requiredRoles={['admin']}><Settings /></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RoleProvider>
      </CompanySettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
