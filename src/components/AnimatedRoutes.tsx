import { lazy, Suspense, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ProtectedRoute, PublicRoute, MobileRestrictedRoute } from "@/components/auth";
import { PageLoader } from "@/components/ui/page-loader";
import { DashboardPageLoader } from "@/components/dashboard/DashboardPageLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigationDirection, type NavDirection } from "@/hooks/useNavigationDirection";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import EmailActionResult from "@/pages/EmailActionResult";

const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Employees = lazy(() => import("@/pages/Employees"));
const EmployeeProfile = lazy(() => import("@/pages/EmployeeProfile"));
const OnboardingDetail = lazy(() => import("@/pages/OnboardingDetail"));
const NewOnboarding = lazy(() => import("@/pages/NewOnboarding"));
const AddTeamMember = lazy(() => import("@/pages/AddTeamMember"));
const BulkSalaryUpdate = lazy(() => import("@/pages/BulkSalaryUpdate"));
const Payroll = lazy(() => import("@/pages/Payroll"));
const PayrollRun = lazy(() => import("@/pages/PayrollRun"));
const PayslipTemplates = lazy(() => import("@/pages/PayslipTemplates"));
const PayslipTemplateEditor = lazy(() => import("@/pages/PayslipTemplateEditor"));
const Payslip = lazy(() => import("@/pages/Payslip"));
const Benefits = lazy(() => import("@/pages/Benefits"));
const BenefitDetail = lazy(() => import("@/pages/BenefitDetail"));
const BenefitEnrollment = lazy(() => import("@/pages/BenefitEnrollment"));
const ClaimSubmission = lazy(() => import("@/pages/ClaimSubmission"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Projects = lazy(() => import("@/pages/Projects"));
const TimeOff = lazy(() => import("@/pages/TimeOff"));
const TimeManagement = lazy(() => import("@/pages/TimeManagement"));
const Documents = lazy(() => import("@/pages/Documents"));
const Directory = lazy(() => import("@/pages/Directory"));
const Loans = lazy(() => import("@/pages/Loans"));
const Approvals = lazy(() => import("@/pages/Approvals"));
const MyProfile = lazy(() => import("@/pages/MyProfile"));
const MyPayslip = lazy(() => import("@/pages/MyPayslip"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const Hiring = lazy(() => import("@/pages/Hiring"));
const CandidateDetail = lazy(() => import("@/pages/CandidateDetail"));
const LeaveRequestDetail = lazy(() => import("@/pages/LeaveRequestDetail"));
const OfferDetail = lazy(() => import("@/pages/OfferDetail"));
const BusinessTrips = lazy(() => import("@/pages/BusinessTrips"));
const BusinessTripDetail = lazy(() => import("@/pages/BusinessTripDetail"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const MobileRequestsPage = lazy(() => import("@/pages/MobileRequestsPage"));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function DashboardLazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<DashboardPageLoader />}>{children}</Suspense>;
}

const EASE = [0.2, 0.6, 0.2, 1] as const;

const mobileVariants = {
  initial: (dir: NavDirection) => ({
    x: dir === "back" ? "-25%" : dir === "replace" ? 0 : "100%",
    opacity: dir === "replace" ? 0 : 1,
  }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: NavDirection) => ({
    x: dir === "back" ? "100%" : dir === "replace" ? 0 : "-25%",
    opacity: dir === "replace" ? 0 : 1,
  }),
};

const desktopVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function AnimatedRoutes() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const direction = useNavigationDirection();

  const variants = useMemo(
    () => (isMobile ? mobileVariants : desktopVariants),
    [isMobile]
  );
  const transition = useMemo(
    () => ({ duration: isMobile ? 0.22 : 0.18, ease: EASE }),
    [isMobile]
  );

  // Auth and email-action pages: render outside the animated tree to avoid
  // slide effects on the login screen.
  const isAuthRoute =
    location.pathname === "/auth" ||
    location.pathname === "/auth/reset-password" ||
    location.pathname === "/email-action-result";

  if (isAuthRoute) {
    return (
      <Routes location={location}>
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/auth/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
        <Route path="/email-action-result" element={<EmailActionResult />} />
      </Routes>
    );
  }

  if (reduceMotion) {
    return <RouteTable location={location} />;
  }

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        style={{ willChange: "transform, opacity" }}
        className="h-full"
      >
        <RouteTable location={location} />
      </motion.div>
    </AnimatePresence>
  );
}

function RouteTable({ location }: { location: ReturnType<typeof useLocation> }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><DashboardLazyPage><MobileRequestsPage /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute><DashboardLazyPage><Directory /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><DashboardLazyPage><Calendar /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><DashboardLazyPage><Projects /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/time-management/leave/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><LeaveRequestDetail /></DashboardLazyPage></ProtectedRoute>} />
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

      <Route path="/employees" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Employees /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/employees/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin', 'manager']}><DashboardLazyPage><EmployeeProfile /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/employees/onboarding/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><NewOnboarding /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/employees/onboarding/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><OnboardingDetail /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payroll"><DashboardLazyPage><Payroll /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/payroll/run" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payroll Run"><DashboardLazyPage><PayrollRun /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/payroll/templates" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payslip Templates"><DashboardLazyPage><PayslipTemplates /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/payroll/templates/new" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payslip Templates"><DashboardLazyPage><PayslipTemplateEditor /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/payroll/templates/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payslip Templates"><DashboardLazyPage><PayslipTemplateEditor /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/payroll/payslip/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Payslip Details"><DashboardLazyPage><Payslip /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Loans /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/hiring" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Hiring /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/hiring/candidates/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><CandidateDetail /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/hiring/offers/:id" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><OfferDetail /></DashboardLazyPage></ProtectedRoute>} />

      <Route path="/team/add" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><DashboardLazyPage><AddTeamMember /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/team/bulk-salary-update" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Bulk Salary Update"><DashboardLazyPage><BulkSalaryUpdate /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute requiredRoles={['manager', 'hr', 'admin']}><MobileRestrictedRoute featureName="Reports & Analytics"><DashboardLazyPage><Reports /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/time-management" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><TimeManagement /></DashboardLazyPage></ProtectedRoute>} />

      <Route path="/documents" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><DashboardLazyPage><Documents /></DashboardLazyPage></ProtectedRoute>} />
      <Route path="/audit-trail" element={<ProtectedRoute requiredRoles={['hr', 'admin']}><MobileRestrictedRoute featureName="Audit Trail"><DashboardLazyPage><AuditTrail /></DashboardLazyPage></MobileRestrictedRoute></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLazyPage><Settings /></DashboardLazyPage></ProtectedRoute>} />

      <Route path="/help-center" element={<ProtectedRoute><DashboardLazyPage><HelpCenter /></DashboardLazyPage></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
