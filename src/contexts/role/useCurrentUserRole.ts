import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, CurrentUser, mockCurrentUser } from '@/data/roles';
import { getHighestPriorityRole } from './constants';

interface Profile {
  id: string;
  employee_id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface UseCurrentUserRoleResult {
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>;
  isLoading: boolean;
}

export function useCurrentUserRole(
  user: User | null,
  profile: Profile | null
): UseCurrentUserRoleResult {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(mockCurrentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setCurrentUser(mockCurrentUser);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all user roles and determine the highest priority one
        const { data: rolesData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        let role: AppRole = 'employee';
        if (!roleError && rolesData && rolesData.length > 0) {
          role = getHighestPriorityRole(rolesData.map(r => r.role as AppRole));
        }

        // Update current user with profile and role info
        setCurrentUser({
          id: user.id,
          name: profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'User'
            : user.email || 'User',
          email: user.email || '',
          role,
          avatar: profile?.avatar_url || '',
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
      }

      setIsLoading(false);
    };

    fetchUserRole();
  }, [user, profile]);

  return { currentUser, setCurrentUser, isLoading };
}
