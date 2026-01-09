/**
 * Dashboard Types Barrel Export
 */

export * from './common';

// Re-export hook data types for convenience
export type { AdminDashboardData } from '@/hooks/useAdminDashboard';
export type { PersonalDashboardData } from '@/hooks/usePersonalDashboard';
export type { TeamDashboardData } from '@/hooks/useTeamDashboard';
