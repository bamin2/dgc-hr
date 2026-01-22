import { Employee, mockEmployees } from './employees';

// Note: This is legacy mock data. The app now uses real types from @/types/benefits
export type BenefitType = 'health' | 'dental' | 'vision' | 'retirement' | 'life' | 'disability' | 'wellness' | 'air_ticket' | 'car_park' | 'phone' | 'other';
export type BenefitStatus = 'active' | 'inactive';
export type EnrollmentStatus = 'active' | 'pending' | 'cancelled';
export type ClaimStatus = 'pending' | 'processing' | 'approved' | 'denied';

export interface CoverageLevel {
  level: 'individual' | 'individual_spouse' | 'individual_children' | 'family';
  employeeCost: number;
  employerCost: number;
}

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitType;
  description: string;
  provider: string;
  coverageLevels: CoverageLevel[];
  features: string[];
  enrollmentDeadline?: string;
  status: BenefitStatus;
  enrolledCount: number;
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  employee: Employee;
  planId: string;
  plan: BenefitPlan;
  coverageLevel: string;
  startDate: string;
  endDate?: string;
  status: EnrollmentStatus;
  monthlyCost: number;
  beneficiaries?: { name: string; relationship: string }[];
  enrollmentDate: string;
}

export interface BenefitClaim {
  id: string;
  employeeId: string;
  employee: Employee;
  planId: string;
  plan: BenefitPlan;
  claimType: string;
  amount: number;
  dateOfService: string;
  provider: string;
  description: string;
  status: ClaimStatus;
  submittedDate: string;
  processedDate?: string;
  approvedAmount?: number;
  denialReason?: string;
}

export interface BenefitsMetrics {
  totalPlans: number;
  activeEnrollments: number;
  pendingClaims: number;
  monthlyBenefitsCost: number;
  enrollmentRate: number;
}

export const benefitPlans: BenefitPlan[] = [
  {
    id: 'plan-1',
    name: 'Premium Health Insurance',
    type: 'health',
    description: 'Comprehensive health coverage including preventive care, hospitalization, and prescription drugs.',
    provider: 'Blue Cross Blue Shield',
    coverageLevels: [
      { level: 'individual', employeeCost: 150, employerCost: 450 },
      { level: 'individual_spouse', employeeCost: 280, employerCost: 720 },
      { level: 'individual_children', employeeCost: 250, employerCost: 650 },
      { level: 'family', employeeCost: 380, employerCost: 920 }
    ],
    features: ['$500 deductible', '80% co-insurance', 'Nationwide network', 'Telehealth included', 'Mental health coverage'],
    enrollmentDeadline: '2024-12-31',
    status: 'active',
    enrolledCount: 45
  },
  {
    id: 'plan-2',
    name: 'Dental Care Plus',
    type: 'dental',
    description: 'Full dental coverage including preventive, basic, and major services.',
    provider: 'Delta Dental',
    coverageLevels: [
      { level: 'individual', employeeCost: 25, employerCost: 75 },
      { level: 'individual_spouse', employeeCost: 45, employerCost: 135 },
      { level: 'individual_children', employeeCost: 40, employerCost: 120 },
      { level: 'family', employeeCost: 65, employerCost: 185 }
    ],
    features: ['100% preventive coverage', '80% basic procedures', '50% major procedures', 'Orthodontia for children'],
    enrollmentDeadline: '2024-12-31',
    status: 'active',
    enrolledCount: 38
  },
  {
    id: 'plan-3',
    name: 'Vision Care',
    type: 'vision',
    description: 'Annual eye exams and allowances for glasses or contact lenses.',
    provider: 'VSP Vision',
    coverageLevels: [
      { level: 'individual', employeeCost: 10, employerCost: 30 },
      { level: 'individual_spouse', employeeCost: 18, employerCost: 52 },
      { level: 'individual_children', employeeCost: 16, employerCost: 44 },
      { level: 'family', employeeCost: 25, employerCost: 75 }
    ],
    features: ['Annual eye exam', '$200 frame allowance', '$150 contact lens allowance', 'Discounts on LASIK'],
    status: 'active',
    enrolledCount: 32
  },
  {
    id: 'plan-4',
    name: '401(k) Retirement Plan',
    type: 'retirement',
    description: 'Tax-advantaged retirement savings with employer matching.',
    provider: 'Fidelity Investments',
    coverageLevels: [
      { level: 'individual', employeeCost: 0, employerCost: 0 }
    ],
    features: ['6% employer match', 'Immediate vesting', 'Wide investment options', 'Roth 401(k) available', 'Financial planning tools'],
    status: 'active',
    enrolledCount: 52
  },
  {
    id: 'plan-5',
    name: 'Life Insurance',
    type: 'life',
    description: 'Term life insurance coverage for employees and dependents.',
    provider: 'MetLife',
    coverageLevels: [
      { level: 'individual', employeeCost: 15, employerCost: 35 },
      { level: 'individual_spouse', employeeCost: 28, employerCost: 62 },
      { level: 'individual_children', employeeCost: 22, employerCost: 48 },
      { level: 'family', employeeCost: 40, employerCost: 90 }
    ],
    features: ['2x annual salary coverage', 'Accidental death benefit', 'Spouse coverage available', 'Child coverage available'],
    status: 'active',
    enrolledCount: 41
  },
  {
    id: 'plan-6',
    name: 'Disability Insurance',
    type: 'disability',
    description: 'Short-term and long-term disability coverage.',
    provider: 'Unum',
    coverageLevels: [
      { level: 'individual', employeeCost: 20, employerCost: 60 }
    ],
    features: ['60% income replacement', '90-day elimination period', 'Coverage to age 65', 'Return-to-work program'],
    status: 'active',
    enrolledCount: 35
  }
];

export const benefitEnrollments: BenefitEnrollment[] = [
  {
    id: 'enroll-1',
    employeeId: '1',
    employee: mockEmployees[0],
    planId: 'plan-1',
    plan: benefitPlans[0],
    coverageLevel: 'family',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 380,
    beneficiaries: [
      { name: 'John Johnson', relationship: 'Spouse' },
      { name: 'Emma Johnson', relationship: 'Child' }
    ],
    enrollmentDate: '2023-11-15'
  },
  {
    id: 'enroll-2',
    employeeId: '1',
    employee: mockEmployees[0],
    planId: 'plan-2',
    plan: benefitPlans[1],
    coverageLevel: 'family',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 65,
    enrollmentDate: '2023-11-15'
  },
  {
    id: 'enroll-3',
    employeeId: '2',
    employee: mockEmployees[1],
    planId: 'plan-1',
    plan: benefitPlans[0],
    coverageLevel: 'individual',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 150,
    enrollmentDate: '2023-11-20'
  },
  {
    id: 'enroll-4',
    employeeId: '2',
    employee: mockEmployees[1],
    planId: 'plan-4',
    plan: benefitPlans[3],
    coverageLevel: 'individual',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 0,
    enrollmentDate: '2023-11-20'
  },
  {
    id: 'enroll-5',
    employeeId: '3',
    employee: mockEmployees[2],
    planId: 'plan-1',
    plan: benefitPlans[0],
    coverageLevel: 'individual_spouse',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 280,
    enrollmentDate: '2023-11-18'
  },
  {
    id: 'enroll-6',
    employeeId: '4',
    employee: mockEmployees[3],
    planId: 'plan-3',
    plan: benefitPlans[2],
    coverageLevel: 'individual',
    startDate: '2024-01-01',
    status: 'pending',
    monthlyCost: 10,
    enrollmentDate: '2024-01-05'
  },
  {
    id: 'enroll-7',
    employeeId: '5',
    employee: mockEmployees[4],
    planId: 'plan-5',
    plan: benefitPlans[4],
    coverageLevel: 'family',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 40,
    beneficiaries: [
      { name: 'Tom Wang', relationship: 'Spouse' },
      { name: 'Lucy Wang', relationship: 'Child' }
    ],
    enrollmentDate: '2023-11-22'
  },
  {
    id: 'enroll-8',
    employeeId: '7',
    employee: mockEmployees[6],
    planId: 'plan-1',
    plan: benefitPlans[0],
    coverageLevel: 'individual',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 150,
    enrollmentDate: '2023-11-25'
  },
  {
    id: 'enroll-9',
    employeeId: '8',
    employee: mockEmployees[7],
    planId: 'plan-6',
    plan: benefitPlans[5],
    coverageLevel: 'individual',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 20,
    enrollmentDate: '2023-11-28'
  },
  {
    id: 'enroll-10',
    employeeId: '9',
    employee: mockEmployees[8],
    planId: 'plan-2',
    plan: benefitPlans[1],
    coverageLevel: 'individual_children',
    startDate: '2024-01-01',
    status: 'active',
    monthlyCost: 40,
    enrollmentDate: '2023-12-01'
  }
];

export const benefitClaims: BenefitClaim[] = [
  {
    id: 'claim-1',
    employeeId: '1',
    employee: mockEmployees[0],
    planId: 'plan-1',
    plan: benefitPlans[0],
    claimType: 'Medical Visit',
    amount: 250,
    dateOfService: '2024-01-10',
    provider: 'Bay Area Medical Center',
    description: 'Annual physical examination',
    status: 'approved',
    submittedDate: '2024-01-12',
    processedDate: '2024-01-15',
    approvedAmount: 200
  },
  {
    id: 'claim-2',
    employeeId: '2',
    employee: mockEmployees[1],
    planId: 'plan-2',
    plan: benefitPlans[1],
    claimType: 'Dental Procedure',
    amount: 450,
    dateOfService: '2024-01-08',
    provider: 'Smile Dental Clinic',
    description: 'Root canal treatment',
    status: 'processing',
    submittedDate: '2024-01-09'
  },
  {
    id: 'claim-3',
    employeeId: '3',
    employee: mockEmployees[2],
    planId: 'plan-3',
    plan: benefitPlans[2],
    claimType: 'Eye Exam',
    amount: 150,
    dateOfService: '2024-01-05',
    provider: 'ClearView Optometry',
    description: 'Annual eye examination and new glasses',
    status: 'approved',
    submittedDate: '2024-01-06',
    processedDate: '2024-01-10',
    approvedAmount: 150
  },
  {
    id: 'claim-4',
    employeeId: '5',
    employee: mockEmployees[4],
    planId: 'plan-1',
    plan: benefitPlans[0],
    claimType: 'Specialist Visit',
    amount: 350,
    dateOfService: '2024-01-15',
    provider: 'SF Cardiology Associates',
    description: 'Cardiology consultation',
    status: 'pending',
    submittedDate: '2024-01-16'
  },
  {
    id: 'claim-5',
    employeeId: '7',
    employee: mockEmployees[6],
    planId: 'plan-1',
    plan: benefitPlans[0],
    claimType: 'Emergency Room',
    amount: 1200,
    dateOfService: '2024-01-03',
    provider: 'UCSF Emergency Department',
    description: 'Emergency room visit for severe allergic reaction',
    status: 'approved',
    submittedDate: '2024-01-04',
    processedDate: '2024-01-12',
    approvedAmount: 960
  },
  {
    id: 'claim-6',
    employeeId: '8',
    employee: mockEmployees[7],
    planId: 'plan-2',
    plan: benefitPlans[1],
    claimType: 'Dental Cleaning',
    amount: 120,
    dateOfService: '2024-01-18',
    provider: 'Downtown Dental',
    description: 'Routine dental cleaning and checkup',
    status: 'pending',
    submittedDate: '2024-01-19'
  },
  {
    id: 'claim-7',
    employeeId: '9',
    employee: mockEmployees[8],
    planId: 'plan-1',
    plan: benefitPlans[0],
    claimType: 'Lab Work',
    amount: 280,
    dateOfService: '2024-01-12',
    provider: 'Quest Diagnostics',
    description: 'Blood work and lab tests',
    status: 'denied',
    submittedDate: '2024-01-13',
    processedDate: '2024-01-17',
    denialReason: 'Service not covered under current plan'
  }
];

export const getBenefitsMetrics = (): BenefitsMetrics => {
  const activeEnrollments = benefitEnrollments.filter(e => e.status === 'active').length;
  const pendingClaims = benefitClaims.filter(c => c.status === 'pending').length;
  const monthlyBenefitsCost = benefitEnrollments
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + e.monthlyCost, 0);
  const totalEmployees = mockEmployees.filter(e => e.status === 'active').length;
  const enrollmentRate = Math.round((activeEnrollments / totalEmployees) * 100);

  return {
    totalPlans: benefitPlans.filter(p => p.status === 'active').length,
    activeEnrollments,
    pendingClaims,
    monthlyBenefitsCost,
    enrollmentRate
  };
};
