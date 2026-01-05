export type OffboardingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type OffboardingTaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type OffboardingTaskCategory = 'exit_interview' | 'asset_return' | 'access_revocation' | 'knowledge_transfer' | 'final_settlement';
export type OffboardingTaskAssignee = 'employee' | 'hr' | 'manager' | 'it' | 'finance';
export type DepartureReason = 'resignation' | 'termination' | 'retirement' | 'end_of_contract' | 'other';
export type NoticePeriodStatus = 'serving' | 'waived' | 'garden_leave';
export type InterviewFormat = 'in_person' | 'video' | 'written';
export type AssetType = 'hardware' | 'keycard' | 'documents' | 'other';
export type AssetCondition = 'pending' | 'good' | 'damaged' | 'missing';
export type AccessSystemType = 'email' | 'cloud' | 'internal' | 'third_party' | 'physical';
export type AccessStatus = 'active' | 'scheduled' | 'revoked';

export interface OffboardingTask {
  id: string;
  title: string;
  description: string;
  category: OffboardingTaskCategory;
  assignedTo: OffboardingTaskAssignee;
  status: OffboardingTaskStatus;
  required: boolean;
  order: number;
}

export interface ExitInterviewData {
  scheduledDate: string;
  scheduledTime: string;
  interviewer: string;
  format: InterviewFormat;
  skipInterview: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  serialNumber: string;
  condition: AssetCondition;
  notes: string;
}

export interface AccessSystem {
  id: string;
  name: string;
  type: AccessSystemType;
  accessLevel: string;
  revocationDate: string;
  status: AccessStatus;
}

export interface EmployeeDepartureData {
  lastWorkingDay: string;
  departureReason: DepartureReason;
  resignationLetterReceived: boolean;
  noticePeriodStatus: NoticePeriodStatus;
  managerConfirmed: boolean;
}

export const defaultAssets: AssetItem[] = [
  { id: '1', name: 'Laptop', type: 'hardware', serialNumber: '', condition: 'pending', notes: '' },
  { id: '2', name: 'Mobile Phone', type: 'hardware', serialNumber: '', condition: 'pending', notes: '' },
  { id: '3', name: 'Access Card', type: 'keycard', serialNumber: '', condition: 'pending', notes: '' },
  { id: '4', name: 'Parking Pass', type: 'keycard', serialNumber: '', condition: 'pending', notes: '' },
  { id: '5', name: 'Company Credit Card', type: 'other', serialNumber: '', condition: 'pending', notes: '' },
  { id: '6', name: 'Office Keys', type: 'other', serialNumber: '', condition: 'pending', notes: '' },
  { id: '7', name: 'Documents/Files', type: 'documents', serialNumber: '', condition: 'pending', notes: '' },
];

export const defaultAccessSystems: AccessSystem[] = [
  { id: '1', name: 'Corporate Email', type: 'email', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
  { id: '2', name: 'Google Workspace', type: 'cloud', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
  { id: '3', name: 'Slack', type: 'cloud', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
  { id: '4', name: 'GitHub', type: 'cloud', accessLevel: 'Developer', revocationDate: '', status: 'scheduled' },
  { id: '5', name: 'AWS Console', type: 'cloud', accessLevel: 'Developer', revocationDate: '', status: 'scheduled' },
  { id: '6', name: 'CRM (Salesforce)', type: 'internal', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
  { id: '7', name: 'HR Portal', type: 'internal', accessLevel: 'Employee', revocationDate: '', status: 'scheduled' },
  { id: '8', name: 'VPN Access', type: 'internal', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
  { id: '9', name: 'Building Access', type: 'physical', accessLevel: 'Standard', revocationDate: '', status: 'scheduled' },
];

export const departureReasons: { value: DepartureReason; label: string }[] = [
  { value: 'resignation', label: 'Resignation' },
  { value: 'termination', label: 'Termination' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'end_of_contract', label: 'End of Contract' },
  { value: 'other', label: 'Other' },
];

export const noticePeriodStatuses: { value: NoticePeriodStatus; label: string }[] = [
  { value: 'serving', label: 'Serving Notice Period' },
  { value: 'waived', label: 'Notice Period Waived' },
  { value: 'garden_leave', label: 'Garden Leave' },
];

export const interviewFormats: { value: InterviewFormat; label: string; description: string }[] = [
  { value: 'in_person', label: 'In-person', description: 'Face-to-face meeting at the office' },
  { value: 'video', label: 'Video Call', description: 'Remote meeting via video conferencing' },
  { value: 'written', label: 'Written Questionnaire', description: 'Employee completes a form independently' },
];

export const assetConditions: { value: AssetCondition; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'good', label: 'Returned (Good)' },
  { value: 'damaged', label: 'Returned (Damaged)' },
  { value: 'missing', label: 'Missing' },
];
