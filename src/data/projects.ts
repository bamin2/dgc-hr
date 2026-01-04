import { mockEmployees } from "./employees";

export type ProjectStatus = 'in_progress' | 'todo' | 'need_review' | 'done';
export type ProjectPriority = 'high' | 'medium' | 'low';
export type ActivityType = 'status_change' | 'assignee_added' | 'assignee_removed' | 'comment' | 'created';

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: ActivityType;
  userId: string;
  timestamp: Date;
  oldStatus?: ProjectStatus;
  newStatus?: ProjectStatus;
  assigneeId?: string;
  comment?: string;
  mentionedUserIds?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: Date;
  startDate: Date;
  endDate: Date;
  commentsCount: number;
  attachmentsCount: number;
  assigneeIds: string[];
  activities: ProjectActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export const projectStatuses: Record<ProjectStatus, { label: string; icon: string; color: string }> = {
  in_progress: { label: 'In progress', icon: 'loader', color: 'blue' },
  todo: { label: 'To Do', icon: 'circle', color: 'gray' },
  need_review: { label: 'Need Review', icon: 'alert-circle', color: 'yellow' },
  done: { label: 'Done', icon: 'check-circle', color: 'green' },
};

export const priorityConfig: Record<ProjectPriority, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  high: { 
    label: 'High', 
    dotClass: 'bg-red-500', 
    bgClass: 'bg-red-50 dark:bg-red-950/30', 
    textClass: 'text-red-700 dark:text-red-400' 
  },
  medium: { 
    label: 'Medium', 
    dotClass: 'bg-orange-500', 
    bgClass: 'bg-orange-50 dark:bg-orange-950/30', 
    textClass: 'text-orange-700 dark:text-orange-400' 
  },
  low: { 
    label: 'Low', 
    dotClass: 'bg-green-500', 
    bgClass: 'bg-green-50 dark:bg-green-950/30', 
    textClass: 'text-green-700 dark:text-green-400' 
  },
};

// Helper to get random employees
const getRandomAssignees = (count: number): string[] => {
  const shuffled = [...mockEmployees].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(e => e.id);
};

// Helper to generate mock activities for a project
const generateMockActivities = (projectId: string, createdAt: Date, status: ProjectStatus): ProjectActivity[] => {
  const activities: ProjectActivity[] = [
    {
      id: `${projectId}-act-1`,
      projectId,
      type: 'created',
      userId: 'emp-1',
      timestamp: createdAt,
    },
  ];
  
  // Add a status change activity for in-progress projects
  if (status === 'in_progress' || status === 'need_review' || status === 'done') {
    activities.push({
      id: `${projectId}-act-2`,
      projectId,
      type: 'status_change',
      userId: 'emp-2',
      oldStatus: 'todo',
      newStatus: status === 'done' ? 'in_progress' : status,
      timestamp: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
    });
  }
  
  // Add a comment for projects with comments
  if (Math.random() > 0.5) {
    activities.push({
      id: `${projectId}-act-3`,
      projectId,
      type: 'comment',
      userId: 'emp-3',
      comment: 'Making good progress on this task. Should be ready for review soon.',
      timestamp: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000),
    });
  }
  
  // Add done status for completed projects
  if (status === 'done') {
    activities.push({
      id: `${projectId}-act-4`,
      projectId,
      type: 'status_change',
      userId: 'emp-1',
      oldStatus: 'in_progress',
      newStatus: 'done',
      timestamp: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
    });
  }
  
  return activities;
};

export const mockProjects: Project[] = [
  // In Progress (4)
  {
    id: 'proj-1',
    title: 'Review and Update Job',
    description: 'Analyze current job descriptions and update them to reflect new responsibilities.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(2024, 10, 7),
    startDate: new Date(2024, 10, 7),
    endDate: new Date(2024, 10, 8),
    commentsCount: 4,
    attachmentsCount: 2,
    assigneeIds: getRandomAssignees(6),
    activities: generateMockActivities('proj-1', new Date(2024, 10, 1), 'in_progress'),
    createdAt: new Date(2024, 10, 1),
    updatedAt: new Date(2024, 10, 5),
  },
  {
    id: 'proj-2',
    title: 'Account Manager Training',
    description: 'These projects involve creating training materials for account managers.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(2024, 10, 8),
    startDate: new Date(2024, 10, 8),
    endDate: new Date(2024, 10, 10),
    commentsCount: 2,
    attachmentsCount: 5,
    assigneeIds: getRandomAssignees(7),
    activities: generateMockActivities('proj-2', new Date(2024, 10, 2), 'in_progress'),
    createdAt: new Date(2024, 10, 2),
    updatedAt: new Date(2024, 10, 6),
  },
  {
    id: 'proj-3',
    title: 'Employee Onboarding System',
    description: 'Develop a comprehensive onboarding system for new employees.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(2024, 10, 10),
    startDate: new Date(2024, 10, 9),
    endDate: new Date(2024, 10, 12),
    commentsCount: 8,
    attachmentsCount: 3,
    assigneeIds: getRandomAssignees(5),
    activities: generateMockActivities('proj-3', new Date(2024, 10, 1), 'in_progress'),
    createdAt: new Date(2024, 10, 1),
    updatedAt: new Date(2024, 10, 7),
  },
  {
    id: 'proj-4',
    title: 'Performance Review Templates',
    description: 'Create standardized performance review templates for all departments.',
    status: 'in_progress',
    priority: 'low',
    dueDate: new Date(2024, 10, 12),
    startDate: new Date(2024, 10, 10),
    endDate: new Date(2024, 10, 13),
    commentsCount: 1,
    attachmentsCount: 1,
    assigneeIds: getRandomAssignees(4),
    activities: generateMockActivities('proj-4', new Date(2024, 10, 3), 'in_progress'),
    createdAt: new Date(2024, 10, 3),
    updatedAt: new Date(2024, 10, 8),
  },
  // To Do (3)
  {
    id: 'proj-5',
    title: 'Benefits Package Review',
    description: 'Review and compare current benefits packages with industry standards.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(2024, 10, 15),
    startDate: new Date(2024, 10, 14),
    endDate: new Date(2024, 10, 16),
    commentsCount: 0,
    attachmentsCount: 2,
    assigneeIds: getRandomAssignees(3),
    activities: generateMockActivities('proj-5', new Date(2024, 10, 5), 'todo'),
    createdAt: new Date(2024, 10, 5),
    updatedAt: new Date(2024, 10, 5),
  },
  {
    id: 'proj-6',
    title: 'Recruitment Campaign Q1',
    description: 'Plan and execute recruitment campaign for Q1 2025 hiring needs.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(2024, 10, 18),
    startDate: new Date(2024, 10, 16),
    endDate: new Date(2024, 10, 20),
    commentsCount: 3,
    attachmentsCount: 0,
    assigneeIds: getRandomAssignees(5),
    activities: generateMockActivities('proj-6', new Date(2024, 10, 4), 'todo'),
    createdAt: new Date(2024, 10, 4),
    updatedAt: new Date(2024, 10, 6),
  },
  {
    id: 'proj-7',
    title: 'Policy Documentation',
    description: 'Update and document all HR policies for the employee handbook.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(2024, 10, 20),
    startDate: new Date(2024, 10, 18),
    endDate: new Date(2024, 10, 22),
    commentsCount: 1,
    attachmentsCount: 4,
    assigneeIds: getRandomAssignees(2),
    activities: generateMockActivities('proj-7', new Date(2024, 10, 6), 'todo'),
    createdAt: new Date(2024, 10, 6),
    updatedAt: new Date(2024, 10, 6),
  },
  // Need Review (10)
  {
    id: 'proj-8',
    title: 'Salary Benchmarking Study',
    description: 'Conduct comprehensive salary benchmarking across all positions.',
    status: 'need_review',
    priority: 'high',
    dueDate: new Date(2024, 10, 9),
    startDate: new Date(2024, 10, 7),
    endDate: new Date(2024, 10, 9),
    commentsCount: 6,
    attachmentsCount: 3,
    assigneeIds: getRandomAssignees(4),
    activities: generateMockActivities('proj-8', new Date(2024, 10, 1), 'need_review'),
    createdAt: new Date(2024, 10, 1),
    updatedAt: new Date(2024, 10, 7),
  },
  {
    id: 'proj-9',
    title: 'Team Building Event Planning',
    description: 'Organize quarterly team building event for all departments.',
    status: 'need_review',
    priority: 'medium',
    dueDate: new Date(2024, 10, 11),
    startDate: new Date(2024, 10, 9),
    endDate: new Date(2024, 10, 11),
    commentsCount: 5,
    attachmentsCount: 1,
    assigneeIds: getRandomAssignees(6),
    activities: generateMockActivities('proj-9', new Date(2024, 10, 2), 'need_review'),
    createdAt: new Date(2024, 10, 2),
    updatedAt: new Date(2024, 10, 8),
  },
  {
    id: 'proj-10',
    title: 'Exit Interview Process',
    description: 'Redesign exit interview process to gather more actionable insights.',
    status: 'need_review',
    priority: 'low',
    dueDate: new Date(2024, 10, 13),
    startDate: new Date(2024, 10, 11),
    endDate: new Date(2024, 10, 13),
    commentsCount: 2,
    attachmentsCount: 2,
    assigneeIds: getRandomAssignees(3),
    activities: generateMockActivities('proj-10', new Date(2024, 10, 3), 'need_review'),
    createdAt: new Date(2024, 10, 3),
    updatedAt: new Date(2024, 10, 9),
  },
  {
    id: 'proj-11',
    title: 'Learning Management System',
    description: 'Evaluate and implement a new learning management system.',
    status: 'need_review',
    priority: 'high',
    dueDate: new Date(2024, 10, 14),
    startDate: new Date(2024, 10, 12),
    endDate: new Date(2024, 10, 15),
    commentsCount: 7,
    attachmentsCount: 5,
    assigneeIds: getRandomAssignees(5),
    activities: generateMockActivities('proj-11', new Date(2024, 10, 4), 'need_review'),
    createdAt: new Date(2024, 10, 4),
    updatedAt: new Date(2024, 10, 10),
  },
  {
    id: 'proj-12',
    title: 'Diversity Initiative',
    description: 'Develop and launch diversity and inclusion initiatives.',
    status: 'need_review',
    priority: 'medium',
    dueDate: new Date(2024, 10, 16),
    startDate: new Date(2024, 10, 14),
    endDate: new Date(2024, 10, 17),
    commentsCount: 4,
    attachmentsCount: 2,
    assigneeIds: getRandomAssignees(7),
    activities: generateMockActivities('proj-12', new Date(2024, 10, 5), 'need_review'),
    createdAt: new Date(2024, 10, 5),
    updatedAt: new Date(2024, 10, 11),
  },
  {
    id: 'proj-13',
    title: 'Compliance Training Update',
    description: 'Update mandatory compliance training modules for all staff.',
    status: 'need_review',
    priority: 'high',
    dueDate: new Date(2024, 10, 17),
    startDate: new Date(2024, 10, 15),
    endDate: new Date(2024, 10, 18),
    commentsCount: 3,
    attachmentsCount: 4,
    assigneeIds: getRandomAssignees(4),
    activities: generateMockActivities('proj-13', new Date(2024, 10, 6), 'need_review'),
    createdAt: new Date(2024, 10, 6),
    updatedAt: new Date(2024, 10, 12),
  },
  {
    id: 'proj-14',
    title: 'Remote Work Policy',
    description: 'Draft and review new remote work policy guidelines.',
    status: 'need_review',
    priority: 'medium',
    dueDate: new Date(2024, 10, 18),
    startDate: new Date(2024, 10, 16),
    endDate: new Date(2024, 10, 19),
    commentsCount: 9,
    attachmentsCount: 1,
    assigneeIds: getRandomAssignees(5),
    activities: generateMockActivities('proj-14', new Date(2024, 10, 7), 'need_review'),
    createdAt: new Date(2024, 10, 7),
    updatedAt: new Date(2024, 10, 13),
  },
  {
    id: 'proj-15',
    title: 'Employee Wellness Program',
    description: 'Design comprehensive employee wellness program.',
    status: 'need_review',
    priority: 'low',
    dueDate: new Date(2024, 10, 19),
    startDate: new Date(2024, 10, 17),
    endDate: new Date(2024, 10, 20),
    commentsCount: 2,
    attachmentsCount: 3,
    assigneeIds: getRandomAssignees(6),
    activities: generateMockActivities('proj-15', new Date(2024, 10, 8), 'need_review'),
    createdAt: new Date(2024, 10, 8),
    updatedAt: new Date(2024, 10, 14),
  },
  {
    id: 'proj-16',
    title: 'Mentorship Program Launch',
    description: 'Launch formal mentorship program for career development.',
    status: 'need_review',
    priority: 'medium',
    dueDate: new Date(2024, 10, 20),
    startDate: new Date(2024, 10, 18),
    endDate: new Date(2024, 10, 21),
    commentsCount: 5,
    attachmentsCount: 2,
    assigneeIds: getRandomAssignees(4),
    activities: generateMockActivities('proj-16', new Date(2024, 10, 9), 'need_review'),
    createdAt: new Date(2024, 10, 9),
    updatedAt: new Date(2024, 10, 15),
  },
  {
    id: 'proj-17',
    title: 'HR Analytics Dashboard',
    description: 'Build HR analytics dashboard for leadership reporting.',
    status: 'need_review',
    priority: 'high',
    dueDate: new Date(2024, 10, 21),
    startDate: new Date(2024, 10, 19),
    endDate: new Date(2024, 10, 22),
    commentsCount: 6,
    attachmentsCount: 1,
    assigneeIds: getRandomAssignees(3),
    activities: generateMockActivities('proj-17', new Date(2024, 10, 10), 'need_review'),
    createdAt: new Date(2024, 10, 10),
    updatedAt: new Date(2024, 10, 16),
  },
  // Done (2)
  {
    id: 'proj-18',
    title: 'Payroll System Migration',
    description: 'Successfully migrated to new payroll processing system.',
    status: 'done',
    priority: 'high',
    dueDate: new Date(2024, 10, 5),
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2024, 10, 5),
    commentsCount: 12,
    attachmentsCount: 8,
    assigneeIds: getRandomAssignees(6),
    activities: generateMockActivities('proj-18', new Date(2024, 9, 25), 'done'),
    createdAt: new Date(2024, 9, 25),
    updatedAt: new Date(2024, 10, 5),
  },
  {
    id: 'proj-19',
    title: 'Q3 Performance Reviews',
    description: 'Completed Q3 performance reviews for all employees.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(2024, 10, 3),
    startDate: new Date(2024, 9, 28),
    endDate: new Date(2024, 10, 3),
    commentsCount: 8,
    attachmentsCount: 4,
    assigneeIds: getRandomAssignees(5),
    activities: generateMockActivities('proj-19', new Date(2024, 9, 20), 'done'),
    createdAt: new Date(2024, 9, 20),
    updatedAt: new Date(2024, 10, 3),
  },
];

// Helper functions
export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return mockProjects.filter(p => p.status === status);
};

export const getProjectAssignees = (project: Project) => {
  return mockEmployees.filter(e => project.assigneeIds.includes(e.id));
};

// Get team members for assignment dropdown (employees with same manager or direct reports)
export const getTeamMembers = (currentEmployeeId: string) => {
  const currentEmployee = mockEmployees.find(e => e.id === currentEmployeeId);
  if (!currentEmployee) return [];
  
  return mockEmployees.filter(e => 
    e.id !== currentEmployeeId && (
      // Peers (same manager)
      (currentEmployee.managerId && e.managerId === currentEmployee.managerId) ||
      // Direct reports (current user is their manager)
      e.managerId === currentEmployeeId
    )
  );
};
