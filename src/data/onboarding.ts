export type OnboardingStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'incomplete';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type TaskCategory = 'documentation' | 'training' | 'setup' | 'introduction' | 'compliance';
export type TaskAssignee = 'employee' | 'hr' | 'manager' | 'it';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  assignedTo: TaskAssignee;
  status: TaskStatus;
  completedAt: string | null;
  completedBy: string | null;
  required: boolean;
  order: number;
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  employeePosition?: string;
  employeeDepartment?: string;
  startDate: string;
  workflow: string;
  scheduledOn: string;
  completedOn: string | null;
  progress: number;
  status: OnboardingStatus;
  tasks?: OnboardingTask[];
}

const generateTasks = (startDate: string, progress: number): OnboardingTask[] => {
  const baseTasks: Omit<OnboardingTask, 'status' | 'completedAt' | 'completedBy'>[] = [
    // Documentation
    { id: 'task-1', title: 'Sign employment contract', description: 'Review and sign the official employment contract with all terms and conditions.', category: 'documentation', dueDate: startDate, assignedTo: 'hr', required: true, order: 1 },
    { id: 'task-2', title: 'Submit ID documents', description: 'Provide copies of government-issued ID, passport, and work authorization documents.', category: 'documentation', dueDate: startDate, assignedTo: 'employee', required: true, order: 2 },
    { id: 'task-3', title: 'Complete W-4 tax form', description: 'Fill out the federal tax withholding form for payroll processing.', category: 'documentation', dueDate: startDate, assignedTo: 'employee', required: true, order: 3 },
    { id: 'task-4', title: 'Direct deposit setup', description: 'Provide bank account details for salary deposits.', category: 'documentation', dueDate: startDate, assignedTo: 'employee', required: false, order: 4 },
    { id: 'task-5', title: 'Emergency contact form', description: 'Submit emergency contact information for company records.', category: 'documentation', dueDate: startDate, assignedTo: 'employee', required: true, order: 5 },
    
    // Training
    { id: 'task-6', title: 'Complete company orientation', description: 'Watch the company orientation video and complete the quiz.', category: 'training', dueDate: startDate, assignedTo: 'employee', required: true, order: 6 },
    { id: 'task-7', title: 'Safety training', description: 'Complete workplace safety training module and certification.', category: 'training', dueDate: startDate, assignedTo: 'employee', required: true, order: 7 },
    { id: 'task-8', title: 'Review employee handbook', description: 'Read through the employee handbook and acknowledge understanding.', category: 'training', dueDate: startDate, assignedTo: 'employee', required: true, order: 8 },
    { id: 'task-9', title: 'Department-specific training', description: 'Complete role-specific training modules assigned by your manager.', category: 'training', dueDate: startDate, assignedTo: 'manager', required: false, order: 9 },
    
    // Setup
    { id: 'task-10', title: 'IT equipment setup', description: 'Receive and set up laptop, monitors, and other assigned equipment.', category: 'setup', dueDate: startDate, assignedTo: 'it', required: true, order: 10 },
    { id: 'task-11', title: 'Email account activation', description: 'Activate corporate email and set up email client.', category: 'setup', dueDate: startDate, assignedTo: 'it', required: true, order: 11 },
    { id: 'task-12', title: 'Access card provisioning', description: 'Receive building access card and set up security credentials.', category: 'setup', dueDate: startDate, assignedTo: 'it', required: true, order: 12 },
    { id: 'task-13', title: 'Software installation', description: 'Install required software and development tools.', category: 'setup', dueDate: startDate, assignedTo: 'it', required: false, order: 13 },
    
    // Introduction
    { id: 'task-14', title: 'Meet with manager', description: 'Schedule and complete one-on-one meeting with direct manager.', category: 'introduction', dueDate: startDate, assignedTo: 'manager', required: true, order: 14 },
    { id: 'task-15', title: 'Team introduction meeting', description: 'Attend team meeting and introduce yourself to colleagues.', category: 'introduction', dueDate: startDate, assignedTo: 'manager', required: true, order: 15 },
    { id: 'task-16', title: 'Office tour', description: 'Complete guided tour of office facilities and amenities.', category: 'introduction', dueDate: startDate, assignedTo: 'hr', required: false, order: 16 },
    { id: 'task-17', title: 'Buddy assignment', description: 'Meet your assigned onboarding buddy for guidance and support.', category: 'introduction', dueDate: startDate, assignedTo: 'hr', required: false, order: 17 },
    
    // Compliance
    { id: 'task-18', title: 'Background check verification', description: 'Complete background check process and verification.', category: 'compliance', dueDate: startDate, assignedTo: 'hr', required: true, order: 18 },
    { id: 'task-19', title: 'NDA signing', description: 'Review and sign non-disclosure agreement.', category: 'compliance', dueDate: startDate, assignedTo: 'hr', required: true, order: 19 },
    { id: 'task-20', title: 'Policy acknowledgment', description: 'Acknowledge understanding of company policies and code of conduct.', category: 'compliance', dueDate: startDate, assignedTo: 'employee', required: true, order: 20 },
  ];

  const totalTasks = baseTasks.length;
  const completedCount = Math.floor((progress / 100) * totalTasks);

  return baseTasks.map((task, index) => ({
    ...task,
    status: index < completedCount ? 'completed' : (index === completedCount && progress > 0 && progress < 100 ? 'in_progress' : 'pending'),
    completedAt: index < completedCount ? 'Dec 15, 2024' : null,
    completedBy: index < completedCount ? 'HR Admin' : null,
  }));
};

export const mockOnboardingRecords: OnboardingRecord[] = [
  {
    id: 'onb-1',
    employeeId: 'emp-1',
    employeeName: 'Tahsan Khan',
    employeeAvatar: '',
    employeePosition: 'Senior Developer',
    employeeDepartment: 'Engineering',
    startDate: 'Nov, 06, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 16, 2024',
    completedOn: 'Jan, 02, 2025',
    progress: 100,
    status: 'completed',
    tasks: generateTasks('Nov, 16, 2024', 100),
  },
  {
    id: 'onb-2',
    employeeId: 'emp-2',
    employeeName: 'Herry Kane',
    employeeAvatar: '',
    employeePosition: 'Product Manager',
    employeeDepartment: 'Product',
    startDate: 'Nov, 08, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 18, 2024',
    completedOn: null,
    progress: 25,
    status: 'in_progress',
    tasks: generateTasks('Nov, 18, 2024', 25),
  },
  {
    id: 'onb-3',
    employeeId: 'emp-3',
    employeeName: 'Jaman Khan',
    employeeAvatar: '',
    employeePosition: 'UX Designer',
    employeeDepartment: 'Design',
    startDate: 'Nov, 09, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 19, 2024',
    completedOn: null,
    progress: 50,
    status: 'pending',
    tasks: generateTasks('Nov, 19, 2024', 50),
  },
  {
    id: 'onb-4',
    employeeId: 'emp-4',
    employeeName: 'Joe Root',
    employeeAvatar: '',
    employeePosition: 'Backend Engineer',
    employeeDepartment: 'Engineering',
    startDate: 'Nov, 10, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 20, 2024',
    completedOn: null,
    progress: 75,
    status: 'in_progress',
    tasks: generateTasks('Nov, 20, 2024', 75),
  },
  {
    id: 'onb-5',
    employeeId: 'emp-5',
    employeeName: 'Janson Roy',
    employeeAvatar: '',
    employeePosition: 'QA Engineer',
    employeeDepartment: 'Quality',
    startDate: 'Nov, 11, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 21, 2024',
    completedOn: null,
    progress: 0,
    status: 'incomplete',
    tasks: generateTasks('Nov, 21, 2024', 0),
  },
  {
    id: 'onb-6',
    employeeId: 'emp-6',
    employeeName: 'James Henry',
    employeeAvatar: '',
    employeePosition: 'DevOps Engineer',
    employeeDepartment: 'Infrastructure',
    startDate: 'Nov, 12, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 22, 2024',
    completedOn: 'Dec, 15, 2024',
    progress: 100,
    status: 'completed',
    tasks: generateTasks('Nov, 22, 2024', 100),
  },
  {
    id: 'onb-7',
    employeeId: 'emp-7',
    employeeName: 'David Warner',
    employeeAvatar: '',
    employeePosition: 'Data Analyst',
    employeeDepartment: 'Analytics',
    startDate: 'Nov, 13, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 23, 2024',
    completedOn: null,
    progress: 75,
    status: 'pending',
    tasks: generateTasks('Nov, 23, 2024', 75),
  },
  {
    id: 'onb-8',
    employeeId: 'emp-8',
    employeeName: 'Herry Brooks',
    employeeAvatar: '',
    employeePosition: 'Marketing Manager',
    employeeDepartment: 'Marketing',
    startDate: 'Nov, 14, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 24, 2024',
    completedOn: null,
    progress: 25,
    status: 'in_progress',
    tasks: generateTasks('Nov, 24, 2024', 25),
  },
  {
    id: 'onb-9',
    employeeId: 'emp-9',
    employeeName: 'Tim David',
    employeeAvatar: '',
    employeePosition: 'Sales Executive',
    employeeDepartment: 'Sales',
    startDate: 'Nov, 15, 2024',
    workflow: 'General',
    scheduledOn: 'Nov, 25, 2024',
    completedOn: null,
    progress: 50,
    status: 'scheduled',
    tasks: generateTasks('Nov, 25, 2024', 50),
  },
];
