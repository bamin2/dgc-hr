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

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedDays: number;
  categories: TaskCategory[];
  tasks: Omit<OnboardingTask, 'status' | 'completedAt' | 'completedBy'>[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Standard onboarding for most roles with essential documentation, training, and introductions.',
    icon: 'Briefcase',
    estimatedDays: 14,
    categories: ['documentation', 'training', 'setup', 'introduction', 'compliance'],
    tasks: [
      { id: 'task-1', title: 'Sign employment contract', description: 'Review and sign the official employment contract.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 1 },
      { id: 'task-2', title: 'Submit ID documents', description: 'Provide copies of government-issued ID and work authorization.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 2 },
      { id: 'task-3', title: 'Complete W-4 tax form', description: 'Fill out federal tax withholding form.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 3 },
      { id: 'task-4', title: 'Direct deposit setup', description: 'Provide bank account details.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: false, order: 4 },
      { id: 'task-5', title: 'Emergency contact form', description: 'Submit emergency contact information.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 5 },
      { id: 'task-6', title: 'Complete company orientation', description: 'Watch orientation video and complete quiz.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 6 },
      { id: 'task-7', title: 'Safety training', description: 'Complete workplace safety training.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 7 },
      { id: 'task-8', title: 'Review employee handbook', description: 'Read and acknowledge employee handbook.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 8 },
      { id: 'task-9', title: 'IT equipment setup', description: 'Set up laptop and equipment.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 9 },
      { id: 'task-10', title: 'Email account activation', description: 'Activate corporate email.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 10 },
      { id: 'task-11', title: 'Access card provisioning', description: 'Receive building access card.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 11 },
      { id: 'task-12', title: 'Meet with manager', description: 'One-on-one with direct manager.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 12 },
      { id: 'task-13', title: 'Team introduction meeting', description: 'Meet team members.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 13 },
      { id: 'task-14', title: 'Office tour', description: 'Tour of office facilities.', category: 'introduction', dueDate: '', assignedTo: 'hr', required: false, order: 14 },
      { id: 'task-15', title: 'Background check verification', description: 'Complete background check.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 15 },
      { id: 'task-16', title: 'NDA signing', description: 'Sign non-disclosure agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 16 },
      { id: 'task-17', title: 'Policy acknowledgment', description: 'Acknowledge company policies.', category: 'compliance', dueDate: '', assignedTo: 'employee', required: true, order: 17 },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Developer-focused onboarding with additional tech setup, coding standards, and development tools.',
    icon: 'Code',
    estimatedDays: 21,
    categories: ['documentation', 'training', 'setup', 'introduction', 'compliance'],
    tasks: [
      { id: 'task-1', title: 'Sign employment contract', description: 'Review and sign the official employment contract.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 1 },
      { id: 'task-2', title: 'Submit ID documents', description: 'Provide copies of government-issued ID.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 2 },
      { id: 'task-3', title: 'Complete W-4 tax form', description: 'Fill out federal tax withholding form.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 3 },
      { id: 'task-4', title: 'Complete company orientation', description: 'Watch orientation video.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 4 },
      { id: 'task-5', title: 'Review employee handbook', description: 'Read employee handbook.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 5 },
      { id: 'task-6', title: 'Engineering standards training', description: 'Learn coding standards and best practices.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 6 },
      { id: 'task-7', title: 'Git workflow training', description: 'Learn branching strategy and PR process.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 7 },
      { id: 'task-8', title: 'Code review introduction', description: 'Learn code review process.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 8 },
      { id: 'task-9', title: 'IT equipment setup', description: 'Set up laptop and monitors.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 9 },
      { id: 'task-10', title: 'Development environment setup', description: 'Install IDE, tools, and dependencies.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 10 },
      { id: 'task-11', title: 'Repository access', description: 'Get access to GitHub/GitLab repos.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 11 },
      { id: 'task-12', title: 'CI/CD pipeline access', description: 'Access to deployment pipelines.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 12 },
      { id: 'task-13', title: 'Meet with manager', description: 'One-on-one with engineering manager.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 13 },
      { id: 'task-14', title: 'Team introduction', description: 'Meet engineering team.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 14 },
      { id: 'task-15', title: 'Architecture overview', description: 'System architecture walkthrough.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 15 },
      { id: 'task-16', title: 'NDA signing', description: 'Sign non-disclosure agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 16 },
      { id: 'task-17', title: 'IP assignment agreement', description: 'Sign intellectual property agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 17 },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Sales-focused onboarding with CRM training, product knowledge, and sales methodology.',
    icon: 'TrendingUp',
    estimatedDays: 14,
    categories: ['documentation', 'training', 'setup', 'introduction', 'compliance'],
    tasks: [
      { id: 'task-1', title: 'Sign employment contract', description: 'Review and sign employment contract.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 1 },
      { id: 'task-2', title: 'Submit ID documents', description: 'Provide identification documents.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 2 },
      { id: 'task-3', title: 'Commission structure review', description: 'Review compensation and commission plan.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 3 },
      { id: 'task-4', title: 'Complete company orientation', description: 'Watch orientation video.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 4 },
      { id: 'task-5', title: 'Product knowledge training', description: 'Learn about products and services.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 5 },
      { id: 'task-6', title: 'CRM training', description: 'Learn Salesforce/CRM system.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 6 },
      { id: 'task-7', title: 'Sales methodology training', description: 'Learn sales process and techniques.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 7 },
      { id: 'task-8', title: 'Competitive landscape training', description: 'Learn about competitors.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 8 },
      { id: 'task-9', title: 'IT equipment setup', description: 'Set up laptop and phone.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 9 },
      { id: 'task-10', title: 'CRM account setup', description: 'Configure CRM access.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 10 },
      { id: 'task-11', title: 'Meet with sales manager', description: 'One-on-one with sales manager.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 11 },
      { id: 'task-12', title: 'Team introduction', description: 'Meet sales team.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 12 },
      { id: 'task-13', title: 'Shadow experienced rep', description: 'Observe sales calls.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 13 },
      { id: 'task-14', title: 'NDA signing', description: 'Sign non-disclosure agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 14 },
    ],
  },
  {
    id: 'remote',
    name: 'Remote',
    description: 'Tailored for remote employees with virtual setup, remote tools, and async communication.',
    icon: 'Globe',
    estimatedDays: 10,
    categories: ['documentation', 'training', 'setup', 'introduction', 'compliance'],
    tasks: [
      { id: 'task-1', title: 'Sign employment contract', description: 'Review and sign employment contract.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 1 },
      { id: 'task-2', title: 'Submit ID documents', description: 'Provide identification documents.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 2 },
      { id: 'task-3', title: 'Home office stipend form', description: 'Request home office equipment stipend.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: false, order: 3 },
      { id: 'task-4', title: 'Complete company orientation', description: 'Watch orientation video.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 4 },
      { id: 'task-5', title: 'Remote work best practices', description: 'Learn remote work guidelines.', category: 'training', dueDate: '', assignedTo: 'employee', required: true, order: 5 },
      { id: 'task-6', title: 'Async communication training', description: 'Learn Slack, email etiquette.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 6 },
      { id: 'task-7', title: 'Laptop shipped and received', description: 'Confirm laptop delivery.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 7 },
      { id: 'task-8', title: 'VPN configuration', description: 'Set up VPN access.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 8 },
      { id: 'task-9', title: 'Collaboration tools setup', description: 'Set up Slack, Zoom, etc.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 9 },
      { id: 'task-10', title: 'Virtual meet with manager', description: 'Video call with manager.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 10 },
      { id: 'task-11', title: 'Virtual team introduction', description: 'Video call with team.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 11 },
      { id: 'task-12', title: 'Virtual buddy assignment', description: 'Meet remote buddy.', category: 'introduction', dueDate: '', assignedTo: 'hr', required: false, order: 12 },
      { id: 'task-13', title: 'NDA signing', description: 'Sign non-disclosure agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 13 },
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Leadership onboarding with board introductions, strategic planning, and executive coaching.',
    icon: 'Crown',
    estimatedDays: 30,
    categories: ['documentation', 'training', 'setup', 'introduction', 'compliance'],
    tasks: [
      { id: 'task-1', title: 'Sign executive contract', description: 'Review and sign executive employment agreement.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 1 },
      { id: 'task-2', title: 'Submit ID documents', description: 'Provide identification documents.', category: 'documentation', dueDate: '', assignedTo: 'employee', required: true, order: 2 },
      { id: 'task-3', title: 'Equity agreement signing', description: 'Review and sign stock option agreement.', category: 'documentation', dueDate: '', assignedTo: 'hr', required: true, order: 3 },
      { id: 'task-4', title: 'Company strategy overview', description: 'Deep dive into company strategy.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 4 },
      { id: 'task-5', title: 'Financial review', description: 'Review company financials.', category: 'training', dueDate: '', assignedTo: 'manager', required: true, order: 5 },
      { id: 'task-6', title: 'Leadership training', description: 'Executive leadership program.', category: 'training', dueDate: '', assignedTo: 'hr', required: true, order: 6 },
      { id: 'task-7', title: 'IT equipment setup', description: 'Set up laptop and equipment.', category: 'setup', dueDate: '', assignedTo: 'it', required: true, order: 7 },
      { id: 'task-8', title: 'Executive assistant assignment', description: 'Meet executive assistant.', category: 'setup', dueDate: '', assignedTo: 'hr', required: false, order: 8 },
      { id: 'task-9', title: 'Board member introductions', description: 'Meet board members.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 9 },
      { id: 'task-10', title: 'Executive team meeting', description: 'Meet C-suite executives.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 10 },
      { id: 'task-11', title: 'Department head meetings', description: 'Meet all department heads.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: true, order: 11 },
      { id: 'task-12', title: 'Key client introductions', description: 'Meet top clients.', category: 'introduction', dueDate: '', assignedTo: 'manager', required: false, order: 12 },
      { id: 'task-13', title: 'NDA signing', description: 'Sign non-disclosure agreement.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 13 },
      { id: 'task-14', title: 'D&O insurance enrollment', description: 'Enroll in directors insurance.', category: 'compliance', dueDate: '', assignedTo: 'hr', required: true, order: 14 },
    ],
  },
];

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
