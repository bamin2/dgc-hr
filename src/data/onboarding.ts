export type OnboardingStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'incomplete';

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  startDate: string;
  workflow: string;
  scheduledOn: string;
  completedOn: string | null;
  progress: number; // 0-100
  status: OnboardingStatus;
}

export const mockOnboardingRecords: OnboardingRecord[] = [
  {
    id: 'onb-1',
    employeeId: 'emp-1',
    employeeName: 'Tahsan Khan',
    employeeAvatar: '',
    startDate: 'Nov, 06, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 16, 2024',
    completedOn: 'Jan, 02, 2025',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'onb-2',
    employeeId: 'emp-2',
    employeeName: 'Herry Kane',
    employeeAvatar: '',
    startDate: 'Nov, 08, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 18, 2024',
    completedOn: null,
    progress: 25,
    status: 'in_progress',
  },
  {
    id: 'onb-3',
    employeeId: 'emp-3',
    employeeName: 'Jaman Khan',
    employeeAvatar: '',
    startDate: 'Nov, 09, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 19, 2024',
    completedOn: null,
    progress: 50,
    status: 'pending',
  },
  {
    id: 'onb-4',
    employeeId: 'emp-4',
    employeeName: 'Joe Root',
    employeeAvatar: '',
    startDate: 'Nov, 10, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 20, 2024',
    completedOn: null,
    progress: 75,
    status: 'in_progress',
  },
  {
    id: 'onb-5',
    employeeId: 'emp-5',
    employeeName: 'Janson Roy',
    employeeAvatar: '',
    startDate: 'Nov, 11, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 21, 2024',
    completedOn: null,
    progress: 0,
    status: 'incomplete',
  },
  {
    id: 'onb-6',
    employeeId: 'emp-6',
    employeeName: 'James Henry',
    employeeAvatar: '',
    startDate: 'Nov, 12, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 22, 2024',
    completedOn: 'Dec, 15, 2024',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'onb-7',
    employeeId: 'emp-7',
    employeeName: 'David Warner',
    employeeAvatar: '',
    startDate: 'Nov, 13, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 23, 2024',
    completedOn: null,
    progress: 75,
    status: 'pending',
  },
  {
    id: 'onb-8',
    employeeId: 'emp-8',
    employeeName: 'Herry Brooks',
    employeeAvatar: '',
    startDate: 'Nov, 14, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 24, 2024',
    completedOn: null,
    progress: 25,
    status: 'in_progress',
  },
  {
    id: 'onb-9',
    employeeId: 'emp-9',
    employeeName: 'Tim David',
    employeeAvatar: '',
    startDate: 'Nov, 15, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 25, 2024',
    completedOn: null,
    progress: 50,
    status: 'scheduled',
  },
];
