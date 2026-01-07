import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device: string | null;
  browser: string | null;
  location: string | null;
  ip_address: string | null;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

// Helper to detect device from user agent
const getDeviceInfo = (): { device: string; browser: string } => {
  const ua = navigator.userAgent;
  
  let device = 'Unknown Device';
  if (/iPhone/.test(ua)) device = 'iPhone';
  else if (/iPad/.test(ua)) device = 'iPad';
  else if (/Android.*Mobile/.test(ua)) device = 'Android Phone';
  else if (/Android/.test(ua)) device = 'Android Tablet';
  else if (/Macintosh/.test(ua)) device = 'Mac';
  else if (/Windows/.test(ua)) device = 'Windows PC';
  else if (/Linux/.test(ua)) device = 'Linux PC';
  
  let browser = 'Unknown Browser';
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match?.[1] || ''}`;
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    const match = ua.match(/Version\/(\d+)/);
    browser = `Safari ${match?.[1] || ''}`;
  } else if (/Firefox/.test(ua)) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match?.[1] || ''}`;
  } else if (/Edg/.test(ua)) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = `Edge ${match?.[1] || ''}`;
  }
  
  return { device, browser };
};

export const useUserSessions = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all sessions for current user
  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
      
      if (error) throw error;
      return data as UserSession[];
    },
    enabled: !!user?.id,
  });

  // Register or update current session
  useEffect(() => {
    const registerSession = async () => {
      if (!user?.id || !session) return;

      const { device, browser } = getDeviceInfo();

      // Check if this device/browser session already exists by matching device and browser directly
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('device', device)
        .eq('browser', browser)
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing session
        await supabase
          .from('user_sessions')
          .update({
            is_current: true,
            last_active: new Date().toISOString(),
          })
          .eq('id', existing.id);
        
        // Mark others as not current
        await supabase
          .from('user_sessions')
          .update({ is_current: false })
          .eq('user_id', user.id)
          .neq('id', existing.id);
      } else {
        // Mark all as not current first
        await supabase
          .from('user_sessions')
          .update({ is_current: false })
          .eq('user_id', user.id);
          
        // Create new session record with a stable token
        const sessionToken = btoa(`${user.id}_${device}_${browser}`).slice(0, 20);
        
        await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            session_token: sessionToken,
            device,
            browser,
            is_current: true,
            location: 'Unknown',
          });
      }

      refetch();
    };

    registerSession();
  }, [user?.id]); // Only re-run when user changes, NOT on token refresh

  // Revoke a specific session
  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });

  // Revoke all sessions except current
  const revokeAllSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('is_current', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });

  return {
    sessions,
    isLoading,
    revokeSession: revokeSession.mutate,
    revokeAllSessions: revokeAllSessions.mutate,
    isRevoking: revokeSession.isPending,
    isRevokingAll: revokeAllSessions.isPending,
  };
};
