import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import OnboardingDetail from "./pages/OnboardingDetail";
import NewOnboarding from "./pages/NewOnboarding";
import TeamMember from "./pages/TeamMember";
import AddTeamMember from "./pages/AddTeamMember";
import Payroll from "./pages/Payroll";
import PayrollRun from "./pages/PayrollRun";
import Payslip from "./pages/Payslip";
import Attendance from "./pages/Attendance";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveDetail from "./pages/LeaveDetail";
import Benefits from "./pages/Benefits";
import BenefitDetail from "./pages/BenefitDetail";
import BenefitEnrollment from "./pages/BenefitEnrollment";
import ClaimSubmission from "./pages/ClaimSubmission";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/projects" element={<Projects />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route path="/employees/onboarding/new" element={<NewOnboarding />} />
            <Route path="/employees/onboarding/:id" element={<OnboardingDetail />} />
            <Route path="/team" element={<TeamMember />} />
            <Route path="/team/add" element={<AddTeamMember />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payroll/run" element={<PayrollRun />} />
            <Route path="/payroll/payslip/:id" element={<Payslip />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/leave/request" element={<LeaveRequest />} />
            <Route path="/attendance/leave/:id" element={<LeaveDetail />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/benefits/plans/:id" element={<BenefitDetail />} />
            <Route path="/benefits/enroll" element={<BenefitEnrollment />} />
            <Route path="/benefits/claims/new" element={<ClaimSubmission />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
