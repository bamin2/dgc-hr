import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { CompanySettingsProvider } from "@/contexts/CompanySettingsContext";
import { CompactModeProvider } from "@/contexts/CompactModeContext";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { PageLoader } from "@/components/ui/page-loader";
import { DashboardPageLoader } from "@/components/dashboard/DashboardPageLoader";

// Critical routes - keep eager for fast initial load
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for reduced initial bundle
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const OnboardingDetail = lazy(() => import("./pages/OnboardingDetail"));
const NewOnboarding = lazy(() => import("./pages/NewOnboarding"));
const AddTeamMember = lazy(() => import("./pages/AddTeamMember"));
const BulkSalaryUpdate = lazy(() => import("./pages/BulkSalaryUpdate"));
const Payroll = lazy(() => import("./pages/Payroll"));
const PayrollRun = lazy(() => import("./pages/PayrollRun"));
const PayslipTemplates = lazy(() => import("./pages/PayslipTemplates"));
const PayslipTemplateEditor = lazy(() => import("./pages/PayslipTemplateEditor"));
const Payslip = lazy(() => import("./pages/Payslip"));
const Benefits = lazy(() => import("./pages/Benefits"));
const BenefitDetail = lazy(() => import("./pages/BenefitDetail"));
const BenefitEnrollment = lazy(() => import("./pages/BenefitEnrollment"));
const ClaimSubmission = lazy(() => import("./pages/ClaimSubmission"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Projects = lazy(() => import("./pages/Projects"));
const TimeOff = lazy(() => import("./pages/TimeOff"));
const TimeManagement = lazy(() => import("./pages/TimeManagement"));
const Documents = lazy(() => import("./pages/Documents"));
const Directory = lazy(() => import("./pages/Directory"));
const Loans = lazy(() => import("./pages/Loans"));
const Approvals = lazy(() => import("./pages/Approvals"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const MyPayslip = lazy(() => import("./pages/MyPayslip"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const Hiring = lazy(() => import("./pages/Hiring"));
const CandidateDetail = lazy(() => import("./pages/CandidateDetail"));
const OfferDetail = lazy(() => import("./pages/OfferDetail"));
const BusinessTrips = lazy(() => import("./pages/BusinessTrips"));
const BusinessTripDetail = lazy(() => import("./pages/BusinessTripDetail"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
    },
  },
});

// Wrapper components for lazy loading with appropriate loaders
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function DashboardLazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<DashboardPageLoader />}>{children}</Suspense>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CompanySettingsProvider>
        <RoleProvider>
          <CompactModeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                <Route path="/auth/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
                
                {/* Protected routes - All authenticated users */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/directory" element={<ProtectedRoute><DashboardLazyPage><Directory /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><DashboardLazyPage><Calendar /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><DashboardLazyPage><Projects /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><TimeManagement /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/time-off" element={<ProtectedRoute><DashboardLazyPage><TimeOff /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/business-trips" element={<ProtectedRoute><DashboardLazyPage><BusinessTrips /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/business-trips/:id" element={<ProtectedRoute><DashboardLazyPage><BusinessTripDetail /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/approvals" element={<ProtectedRoute><DashboardLazyPage><Approvals /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/benefits" element={<ProtectedRoute><DashboardLazyPage><Benefits /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/benefits/plans/:id" element={<ProtectedRoute><DashboardLazyPage><BenefitDetail /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/benefits/enroll" element={<ProtectedRoute><DashboardLazyPage><BenefitEnrollment /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/benefits/claims/new" element={<ProtectedRoute><DashboardLazyPage><ClaimSubmission /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><DashboardLazyPage><Notifications /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/my-profile" element={<ProtectedRoute><DashboardLazyPage><MyProfile /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/my-profile/payslip/:id" element={<ProtectedRoute><DashboardLazyPage><MyPayslip /></DashboardLazyPage></ProtectedRoute>} />
                
                {/* Protected routes - HR & Admin */}
                <Route path="/employees" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Employees /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/employees/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin', 'manager']}><DashboardLazyPage><EmployeeProfile /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/employees/onboarding/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><NewOnboarding /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/employees/onboarding/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><OnboardingDetail /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Payroll /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll/run" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><PayrollRun /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll/templates" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><PayslipTemplates /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll/templates/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><PayslipTemplateEditor /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll/templates/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><PayslipTemplateEditor /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/payroll/payslip/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Payslip /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/loans" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Loans /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/hiring" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Hiring /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/hiring/candidates/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><CandidateDetail /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/hiring/offers/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><OfferDetail /></DashboardLazyPage></ProtectedRoute>} />
                
                {/* Protected routes - Manager, HR & Admin */}
                <Route path="/team/add" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><DashboardLazyPage><AddTeamMember /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/team/bulk-salary-update" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><BulkSalaryUpdate /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><DashboardLazyPage><Reports /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/time-management" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><TimeManagement /></DashboardLazyPage></ProtectedRoute>} />
                
                {/* Protected routes - Admin only */}
                <Route path="/documents" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Documents /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/audit-trail" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><AuditTrail /></DashboardLazyPage></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requiredRoles={['admin']}><DashboardLazyPage><Settings /></DashboardLazyPage></ProtectedRoute>} />
                
                {/* Help Center - All authenticated users */}
                <Route path="/help-center" element={<ProtectedRoute><DashboardLazyPage><HelpCenter /></DashboardLazyPage></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CompactModeProvider>
        </RoleProvider>
      </CompanySettingsProvider>
    </AuthProvider>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);

export default App;
