// Map paths to their lazy import functions
const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Index'),
  '/directory': () => import('@/pages/Directory'),
  '/calendar': () => import('@/pages/Calendar'),
  '/projects': () => import('@/pages/Projects'),
  '/time-off': () => import('@/pages/TimeOff'),
  '/approvals': () => import('@/pages/Approvals'),
  '/benefits': () => import('@/pages/Benefits'),
  '/my-profile': () => import('@/pages/MyProfile'),
  '/employees': () => import('@/pages/Employees'),
  '/hiring': () => import('@/pages/Hiring'),
  '/time-management': () => import('@/pages/TimeManagement'),
  '/reports': () => import('@/pages/Reports'),
  '/payroll': () => import('@/pages/Payroll'),
  '/loans': () => import('@/pages/Loans'),
  '/documents': () => import('@/pages/Documents'),
  '/audit-trail': () => import('@/pages/AuditTrail'),
  '/settings': () => import('@/pages/Settings'),
  '/notifications': () => import('@/pages/Notifications'),
};

// Cache to avoid duplicate prefetch attempts
const prefetchedRoutes = new Set<string>();

export function preloadRoute(path: string): void {
  // Find matching route (handle exact match or prefix match for nested routes)
  const matchingPath = Object.keys(routeLoaders).find(
    (route) => path === route || path.startsWith(route + '/')
  );

  if (!matchingPath || prefetchedRoutes.has(matchingPath)) return;

  prefetchedRoutes.add(matchingPath);
  routeLoaders[matchingPath]();
}
