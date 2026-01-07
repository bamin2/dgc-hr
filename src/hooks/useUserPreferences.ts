import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPreferences, EmployeeTableColumnId, defaultEmployeeTableColumns } from '@/data/settings';
import { Json } from '@/integrations/supabase/types';

interface DbUserPreferences {
  id: string;
  user_id: string;
  language: string;
  theme: string;
  default_page: string;
  items_per_page: number;
  compact_mode: boolean;
  timezone: string;
  date_format: string;
  time_format: string;
  first_day_of_week: string;
  employee_table_columns: Json;
}

interface DbProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

const defaultPreferences: Omit<UserPreferences, 'userId'> = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    jobTitle: '',
  },
  display: {
    language: 'en',
    theme: 'system',
    defaultPage: 'dashboard',
    itemsPerPage: 25,
    compactMode: false,
    employeeTableColumns: defaultEmployeeTableColumns,
  },
  regional: {
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 'sunday',
  },
};

function parseEmployeeTableColumns(json: Json | null | undefined): EmployeeTableColumnId[] {
  if (!json || !Array.isArray(json)) {
    return defaultEmployeeTableColumns;
  }
  return json.filter((col): col is EmployeeTableColumnId => 
    typeof col === 'string' && defaultEmployeeTableColumns.includes(col as EmployeeTableColumnId)
  );
}

function transformFromDb(
  prefs: DbUserPreferences | null, 
  profile: DbProfile | null, 
  userId: string
): UserPreferences {
  return {
    userId,
    profile: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar_url || '',
      jobTitle: profile?.job_title || '',
    },
    display: {
      language: prefs?.language || 'en',
      theme: (prefs?.theme as 'light' | 'dark' | 'system') || 'system',
      defaultPage: prefs?.default_page || 'dashboard',
      itemsPerPage: prefs?.items_per_page || 25,
      compactMode: prefs?.compact_mode || false,
      employeeTableColumns: parseEmployeeTableColumns(prefs?.employee_table_columns),
    },
    regional: {
      timezone: prefs?.timezone || 'America/Los_Angeles',
      dateFormat: prefs?.date_format || 'MM/DD/YYYY',
      timeFormat: (prefs?.time_format as '12h' | '24h') || '12h',
      firstDayOfWeek: (prefs?.first_day_of_week as 'sunday' | 'monday') || 'sunday',
    },
  };
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      // Fetch preferences and profile in parallel
      const [prefsResult, profileResult] = await Promise.all([
        supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
      ]);

      if (prefsResult.error) throw prefsResult.error;
      if (profileResult.error) throw profileResult.error;

      return transformFromDb(
        prefsResult.data as DbUserPreferences | null, 
        profileResult.data as DbProfile | null, 
        user.id
      );
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user?.id) throw new Error('No user');

      const updates: Promise<unknown>[] = [];

      // Update profile if profile fields changed
      if (preferences.profile) {
        const profileData: Record<string, unknown> = {};
        if (preferences.profile.firstName !== undefined) profileData.first_name = preferences.profile.firstName;
        if (preferences.profile.lastName !== undefined) profileData.last_name = preferences.profile.lastName;
        if (preferences.profile.phone !== undefined) profileData.phone = preferences.profile.phone;
        if (preferences.profile.avatar !== undefined) profileData.avatar_url = preferences.profile.avatar;
        if (preferences.profile.jobTitle !== undefined) profileData.job_title = preferences.profile.jobTitle;

        if (Object.keys(profileData).length > 0) {
          const updateProfile = async () => {
            const { error } = await supabase
              .from('profiles')
              .update(profileData)
              .eq('id', user.id);
            if (error) throw error;
          };
          updates.push(updateProfile());
        }
      }

      // Update or create user preferences
      if (preferences.display || preferences.regional) {
        const prefsData = {
          user_id: user.id,
          language: preferences.display?.language,
          theme: preferences.display?.theme,
          default_page: preferences.display?.defaultPage,
          items_per_page: preferences.display?.itemsPerPage,
          compact_mode: preferences.display?.compactMode,
          employee_table_columns: preferences.display?.employeeTableColumns,
          timezone: preferences.regional?.timezone,
          date_format: preferences.regional?.dateFormat,
          time_format: preferences.regional?.timeFormat,
          first_day_of_week: preferences.regional?.firstDayOfWeek,
        };

        // Remove undefined values
        const cleanPrefsData = Object.fromEntries(
          Object.entries(prefsData).filter(([, v]) => v !== undefined)
        ) as { user_id: string; [key: string]: unknown };

        const updatePrefs = async () => {
          const { error } = await supabase
            .from('user_preferences')
            .upsert(cleanPrefsData, { onConflict: 'user_id' });
          if (error) throw error;
        };
        updates.push(updatePrefs());
      }

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
    },
  });

  return {
    preferences: query.data || { ...defaultPreferences, userId: user?.id || '' },
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}