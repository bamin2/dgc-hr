import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ProjectStatus = 'todo' | 'in_progress' | 'need_review' | 'done';
export type ProjectPriority = 'low' | 'medium' | 'high';
export type ActivityType = 'created' | 'status_change' | 'assignee_added' | 'assignee_removed' | 'comment' | 'updated';

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role: string;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    position?: { title: string } | null;
  };
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  actor_id: string | null;
  activity_type: ActivityType;
  old_status: ProjectStatus | null;
  new_status: ProjectStatus | null;
  target_employee_id: string | null;
  comment: string | null;
  mentioned_employee_ids: string[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export interface DbProject {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  due_date: string | null;
  owner_id: string | null;
  department_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Display-friendly interface matching the old mock data structure
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
  activities: ProjectActivityDisplay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectActivityDisplay {
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

function transformProject(
  dbProject: DbProject,
  members: ProjectMember[],
  activities: ProjectActivity[]
): Project {
  const commentsCount = activities.filter(a => a.activity_type === 'comment').length;
  
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    status: dbProject.status,
    priority: dbProject.priority,
    dueDate: dbProject.due_date ? new Date(dbProject.due_date) : new Date(),
    startDate: dbProject.start_date ? new Date(dbProject.start_date) : new Date(),
    endDate: dbProject.end_date ? new Date(dbProject.end_date) : new Date(),
    commentsCount,
    attachmentsCount: 0, // Attachments not implemented yet
    assigneeIds: members.map(m => m.employee_id),
    activities: activities.map(a => ({
      id: a.id,
      projectId: a.project_id,
      type: a.activity_type,
      userId: a.actor_id || '',
      timestamp: new Date(a.created_at),
      oldStatus: a.old_status || undefined,
      newStatus: a.new_status || undefined,
      assigneeId: a.target_employee_id || undefined,
      comment: a.comment || undefined,
      mentionedUserIds: a.mentioned_employee_ids || undefined,
    })),
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at),
  };
}

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects'],
    staleTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch all project members with employee details
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          *,
          employee:employees(id, first_name, last_name, avatar_url, position:positions(title))
        `);

      if (membersError) throw membersError;

      // Fetch all activities with actor details
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('project_activities')
        .select(`
          *,
          actor:employees!project_activities_actor_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Transform and combine data
      const projects = (projectsData as DbProject[]).map(project => {
        const projectMembers = (membersData as ProjectMember[]).filter(m => m.project_id === project.id);
        const projectActivities = (activitiesData as ProjectActivity[]).filter(a => a.project_id === project.id);
        return transformProject(project, projectMembers, projectActivities);
      });

      return projects;
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: Date;
      endDate?: Date;
      dueDate?: Date;
      assigneeIds?: string[];
    }) => {
      // Get current user's employee ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('id', user?.id)
        .single();

      const ownerId = profile?.employee_id;

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: data.title,
          description: data.description,
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          start_date: data.startDate?.toISOString().split('T')[0],
          end_date: data.endDate?.toISOString().split('T')[0],
          due_date: data.dueDate?.toISOString().split('T')[0],
          owner_id: ownerId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add members
      if (data.assigneeIds && data.assigneeIds.length > 0) {
        const memberInserts = data.assigneeIds.map(employeeId => ({
          project_id: project.id,
          employee_id: employeeId,
          role: 'member',
        }));

        const { error: membersError } = await supabase
          .from('project_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      // Add owner as member if exists
      if (ownerId) {
        await supabase
          .from('project_members')
          .upsert({
            project_id: project.id,
            employee_id: ownerId,
            role: 'owner',
          });
      }

      // Add created activity
      if (ownerId) {
        await supabase
          .from('project_activities')
          .insert({
            project_id: project.id,
            actor_id: ownerId,
            activity_type: 'created',
          });
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      status?: ProjectStatus;
      priority?: ProjectPriority;
      startDate?: Date;
      endDate?: Date;
      dueDate?: Date;
    }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.startDate !== undefined) updateData.start_date = data.startDate.toISOString().split('T')[0];
      if (data.endDate !== undefined) updateData.end_date = data.endDate.toISOString().split('T')[0];
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: async (data: { projectId: string; newStatus: ProjectStatus; oldStatus: ProjectStatus }) => {
      // Get current user's employee ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('id', user?.id)
        .single();

      // Update project status
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: data.newStatus })
        .eq('id', data.projectId);

      if (updateError) throw updateError;

      // Add status change activity
      if (profile?.employee_id && data.oldStatus !== data.newStatus) {
        await supabase
          .from('project_activities')
          .insert({
            project_id: data.projectId,
            actor_id: profile.employee_id,
            activity_type: 'status_change',
            old_status: data.oldStatus,
            new_status: data.newStatus,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { projectId: string; comment: string; mentionedUserIds?: string[] }) => {
      // Get current user's employee ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.employee_id) throw new Error('No employee profile');

      const { error } = await supabase
        .from('project_activities')
        .insert({
          project_id: data.projectId,
          actor_id: profile.employee_id,
          activity_type: 'comment',
          comment: data.comment,
          mentioned_employee_ids: data.mentionedUserIds,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    updateProjectStatus: updateProjectStatusMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    addComment: addCommentMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
}

// Hook to get project assignees (employees)
export function useProjectAssignees(projectId: string) {
  return useQuery({
    queryKey: ['project-assignees', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          employee:employees(
            id, 
            first_name, 
            last_name, 
            avatar_url,
            position:positions(title)
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      return data.map(m => m.employee).filter(Boolean);
    },
    enabled: !!projectId,
  });
}

// Hook to get available team members for assignment
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position:positions(title)
        `)
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      return data;
    },
  });
}
