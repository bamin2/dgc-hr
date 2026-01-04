export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  position: string;
  status: 'active' | 'on_leave' | 'on_boarding' | 'probation';
  joinDate: string;
  employeeId: string;
  manager?: string;
  managerId?: string;
  location?: string;
  salary?: number;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const mockEmployees: Employee[] = [
  // CEO - Root of org chart
  {
    id: 'ceo',
    firstName: 'Tahsan',
    lastName: 'Khan',
    email: 'tahsan.khan@franfer.com',
    phone: '+1 (555) 100-0001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'Executive',
    position: 'CEO',
    status: 'active',
    joinDate: '2015-01-01',
    employeeId: 'EMP000',
    location: 'Boston HQ',
    salary: 350000,
  },
  // VP Level - Report to CEO
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@franfer.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    position: 'VP Engineering',
    status: 'active',
    joinDate: '2020-01-10',
    employeeId: 'EMP002',
    managerId: 'ceo',
    location: 'Boston HQ',
    salary: 180000,
  },
  {
    id: '7',
    firstName: 'Amanda',
    lastName: 'Foster',
    email: 'amanda.foster@franfer.com',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    department: 'Marketing',
    position: 'VP Commercial',
    status: 'active',
    joinDate: '2018-04-20',
    employeeId: 'EMP007',
    managerId: 'ceo',
    location: 'Boston HQ',
    salary: 175000,
  },
  {
    id: 'vp-finance',
    firstName: 'Patricia',
    lastName: 'Miller',
    email: 'patricia.miller@franfer.com',
    phone: '+1 (555) 555-0100',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    department: 'Finance',
    position: 'VP Finance',
    status: 'active',
    joinDate: '2017-03-15',
    employeeId: 'EMP011',
    managerId: 'ceo',
    location: 'Boston HQ',
    salary: 170000,
  },
  // Directors - Report to VPs
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@franfer.com',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    department: 'Design',
    position: 'Design Director',
    status: 'active',
    joinDate: '2019-09-05',
    employeeId: 'EMP005',
    managerId: '7',
    location: 'London Office',
    salary: 140000,
  },
  {
    id: '9',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    email: 'jennifer.taylor@franfer.com',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    department: 'Human Resources',
    position: 'HR Director',
    status: 'active',
    joinDate: '2020-05-25',
    employeeId: 'EMP009',
    managerId: '7',
    location: 'Boston HQ',
    salary: 130000,
  },
  // Individual Contributors - Report to Directors/Managers
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@franfer.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'active',
    joinDate: '2022-03-15',
    employeeId: 'EMP001',
    manager: 'Michael Chen',
    managerId: '2',
    location: 'Boston HQ',
    salary: 95000,
    address: '123 Tech Street, San Francisco, CA 94102',
    dateOfBirth: '1990-05-20',
    gender: 'Female',
    nationality: 'American',
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    }
  },
  {
    id: '8',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@franfer.com',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Backend Developer',
    status: 'probation',
    joinDate: '2022-08-10',
    employeeId: 'EMP008',
    manager: 'Michael Chen',
    managerId: '2',
    location: 'London Office',
    salary: 88000,
    address: '258 Code Street, San Francisco, CA 94109',
    dateOfBirth: '1993-01-22',
    gender: 'Male',
    nationality: 'Mexican'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@franfer.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    department: 'Design',
    position: 'UI/UX Designer',
    status: 'on_leave',
    joinDate: '2021-06-20',
    employeeId: 'EMP003',
    manager: 'Lisa Wang',
    managerId: '5',
    location: 'London Office',
    salary: 85000,
    address: '789 Creative Blvd, San Francisco, CA 94104',
    dateOfBirth: '1992-08-30',
    gender: 'Female',
    nationality: 'Canadian'
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@franfer.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    department: 'Marketing',
    position: 'Marketing Specialist',
    status: 'on_boarding',
    joinDate: '2023-02-01',
    employeeId: 'EMP004',
    manager: 'Lisa Wang',
    managerId: '5',
    location: 'London Office',
    salary: 72000,
    address: '321 Brand Street, San Francisco, CA 94105',
    dateOfBirth: '1994-03-15',
    gender: 'Male',
    nationality: 'British'
  },
  {
    id: '6',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@franfer.com',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'Finance',
    position: 'Financial Analyst',
    status: 'probation',
    joinDate: '2021-11-15',
    employeeId: 'EMP006',
    manager: 'Patricia Miller',
    managerId: 'vp-finance',
    location: 'Boston HQ',
    salary: 78000,
    address: '987 Money Lane, San Francisco, CA 94107',
    dateOfBirth: '1991-07-08',
    gender: 'Male',
    nationality: 'American'
  },
  {
    id: '10',
    firstName: 'Kevin',
    lastName: 'Anderson',
    email: 'kevin.anderson@franfer.com',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    department: 'Sales',
    position: 'Sales Representative',
    status: 'on_boarding',
    joinDate: '2023-01-15',
    employeeId: 'EMP010',
    manager: 'Patricia Miller',
    managerId: 'vp-finance',
    location: 'London Office',
    salary: 65000,
    address: '741 Deal Drive, San Francisco, CA 94111',
    dateOfBirth: '1995-10-05',
    gender: 'Male',
    nationality: 'Australian'
  }
];

export const departments = [
  'Executive',
  'Engineering',
  'Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Sales'
];

export const entities = [
  'Franfer Inc.',
  'Franfer EU',
  'Franfer Asia'
];

export const positions = [
  'CEO',
  'VP Engineering',
  'VP Commercial',
  'VP Finance',
  'Senior Developer',
  'Junior Developer',
  'Backend Developer',
  'Frontend Developer',
  'Engineering Manager',
  'UI/UX Designer',
  'Design Director',
  'Marketing Specialist',
  'Marketing Director',
  'Financial Analyst',
  'HR Director',
  'HR Manager',
  'Sales Representative'
];
