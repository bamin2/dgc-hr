import { mockEmployees } from './employees';

export type WorkerType = 'employee' | 'contractor_individual' | 'contractor_business';
export type EmploymentType = 'full_time' | 'part_time' | 'contract';
export type TeamMemberStatus = 'active' | 'draft' | 'absent' | 'onboarding' | 'offboarding' | 'dismissed';
export type PayFrequency = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  avatar?: string;
  workerType: WorkerType;
  country: string;
  startDate: string;
  department: string;
  jobTitle: string;
  employmentType: EmploymentType;
  status: TeamMemberStatus;
  managerId?: string;
  workLocation?: string;
  salary?: number;
  payFrequency?: PayFrequency;
  taxExemptionStatus?: string;
  sendOfferLetter?: boolean;
  offerLetterTemplate?: string;
}

export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
];

export const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Designer',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Coordinator',
  'Financial Analyst',
  'Operations Manager',
  'Customer Support Specialist',
];

export const workLocations = [
  'Remote',
  'New York Office',
  'San Francisco Office',
  'London Office',
  'Singapore Office',
];

export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export const offerTemplates = [
  { id: 'standard', name: 'Standard Offer Letter' },
  { id: 'executive', name: 'Executive Offer Letter' },
  { id: 'contractor', name: 'Contractor Agreement' },
  { id: 'internship', name: 'Internship Offer' },
];

// Generate mock team members from existing employees
export const mockTeamMembers: TeamMember[] = mockEmployees.slice(0, 12).map((emp, index) => ({
  id: emp.id,
  firstName: emp.firstName,
  lastName: emp.lastName,
  preferredName: index % 3 === 0 ? emp.firstName.slice(0, 3) : undefined,
  email: emp.email,
  avatar: emp.avatar,
  workerType: index % 5 === 0 ? 'contractor_individual' : 'employee',
  country: countries[index % countries.length].code,
  startDate: emp.joinDate,
  department: emp.department,
  jobTitle: emp.position,
  employmentType: index % 4 === 0 ? 'part_time' : index % 7 === 0 ? 'contract' : 'full_time',
  status: ['active', 'active', 'active', 'onboarding', 'offboarding', 'active', 'draft', 'active', 'active', 'absent', 'active', 'dismissed'][index] as TeamMemberStatus,
  managerId: emp.managerId,
  workLocation: workLocations[index % workLocations.length],
  salary: 50000 + (index * 10000),
  payFrequency: 'year',
}));
