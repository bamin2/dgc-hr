import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/data/roles';

interface UseAllUserRolesResult {
  userRoles: UserRole[];
  isLoading: boolean;
}

export function useAllUserRoles(user: User | null): UseAllUserRolesResult {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Fetch user_roles and profiles separately, then merge
      const [rolesResult, profilesResult] = await Promise.all([
        supabase.from('user_roles').select('id, user_id, role'),
        supabase.from('profiles').select('id, employee_id'),
      ]);

      if (!rolesResult.error && rolesResult.data) {
        // Build a map of user_id -> employee_id
        const profilesMap = new Map<string, string>();
        if (!profilesResult.error && profilesResult.data) {
          profilesResult.data.forEach(p => {
            if (p.employee_id) {
              profilesMap.set(p.id, p.employee_id);
            }
          });
        }

        setUserRoles(rolesResult.data.map(r => ({
          id: r.id,
          userId: profilesMap.get(r.user_id) || r.user_id,
          role: r.role,
        })));
      }

      setIsLoading(false);
    };

    fetchAllRoles();
  }, [user]);

  return { userRoles, isLoading };
}
