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
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { PageLoader } from "@/components/ui/page-loader";

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
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const Hiring = lazy(() => import("./pages/Hiring"));
const CandidateDetail = lazy(() => import("./pages/CandidateDetail"));
const OfferDetail = lazy(() => import("./pages/OfferDetail"));

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

// Wrapper component to reduce repetition
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

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
                <Route path="/auth/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
                
                {/* Protected routes - All authenticated users */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/directory" element={<ProtectedRoute><LazyPage><Directory /></LazyPage></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><LazyPage><Calendar /></LazyPage></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><LazyPage><Projects /></LazyPage></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><TimeManagement /></LazyPage></ProtectedRoute>} />
                <Route path="/time-off" element={<ProtectedRoute><LazyPage><TimeOff /></LazyPage></ProtectedRoute>} />
                <Route path="/approvals" element={<ProtectedRoute><LazyPage><Approvals /></LazyPage></ProtectedRoute>} />
                <Route path="/benefits" element={<ProtectedRoute><LazyPage><Benefits /></LazyPage></ProtectedRoute>} />
                <Route path="/benefits/plans/:id" element={<ProtectedRoute><LazyPage><BenefitDetail /></LazyPage></ProtectedRoute>} />
                <Route path="/benefits/enroll" element={<ProtectedRoute><LazyPage><BenefitEnrollment /></LazyPage></ProtectedRoute>} />
                <Route path="/benefits/claims/new" element={<ProtectedRoute><LazyPage><ClaimSubmission /></LazyPage></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><LazyPage><Notifications /></LazyPage></ProtectedRoute>} />
                <Route path="/my-profile" element={<ProtectedRoute><LazyPage><MyProfile /></LazyPage></ProtectedRoute>} />
                
                {/* Protected routes - HR & Admin */}
                <Route path="/employees" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Employees /></LazyPage></ProtectedRoute>} />
                <Route path="/employees/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin', 'manager']}><LazyPage><EmployeeProfile /></LazyPage></ProtectedRoute>} />
                <Route path="/employees/onboarding/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><NewOnboarding /></LazyPage></ProtectedRoute>} />
                <Route path="/employees/onboarding/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><OnboardingDetail /></LazyPage></ProtectedRoute>} />
                <Route path="/payroll" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Payroll /></LazyPage></ProtectedRoute>} />
                <Route path="/payroll/run" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><PayrollRun /></LazyPage></ProtectedRoute>} />
                <Route path="/payroll/payslip/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Payslip /></LazyPage></ProtectedRoute>} />
                <Route path="/loans" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Loans /></LazyPage></ProtectedRoute>} />
                <Route path="/hiring" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Hiring /></LazyPage></ProtectedRoute>} />
                <Route path="/hiring/candidates/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><CandidateDetail /></LazyPage></ProtectedRoute>} />
                <Route path="/hiring/offers/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><OfferDetail /></LazyPage></ProtectedRoute>} />
                
                {/* Protected routes - Manager, HR & Admin */}
                <Route path="/team/add" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><LazyPage><AddTeamMember /></LazyPage></ProtectedRoute>} />
                <Route path="/team/bulk-salary-update" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><BulkSalaryUpdate /></LazyPage></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><LazyPage><Reports /></LazyPage></ProtectedRoute>} />
                <Route path="/time-management" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><TimeManagement /></LazyPage></ProtectedRoute>} />
                
                {/* Protected routes - Admin only */}
                <Route path="/documents" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><Documents /></LazyPage></ProtectedRoute>} />
                <Route path="/audit-trail" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><LazyPage><AuditTrail /></LazyPage></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requiredRoles={['admin']}><LazyPage><Settings /></LazyPage></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RoleProvider>
      </CompanySettingsProvider>
    </AuthProvider>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);

export default App;
