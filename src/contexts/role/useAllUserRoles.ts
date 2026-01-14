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

      // Fetch user_roles and employees separately, then merge
      // employees.user_id is now the single source of truth for user-employee linkage
      const [rolesResult, employeesResult] = await Promise.all([
        supabase.from('user_roles').select('id, user_id, role'),
        supabase.from('employees').select('id, user_id'),
      ]);

      if (!rolesResult.error && rolesResult.data) {
        // Build a map of user_id -> employee_id
        const employeesMap = new Map<string, string>();
        if (!employeesResult.error && employeesResult.data) {
          employeesResult.data.forEach(e => {
            if (e.user_id) {
              employeesMap.set(e.user_id, e.id);
            }
          });
        }

        setUserRoles(rolesResult.data.map(r => ({
          id: r.id,
          userId: employeesMap.get(r.user_id) || r.user_id,
          role: r.role,
        })));
      }

      setIsLoading(false);
    };

    fetchAllRoles();
  }, [user]);

  return { userRoles, isLoading };
}
